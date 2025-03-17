import Product from "../../models/product";
import { PipelineStage } from "mongoose";
import { AllUniqueKeyAndValuesFilters, QueryFilter } from "../../types/product";
const create = async (data: any) => {
  const product = new Product(data);
  return await product.save();
};
/*
  to refactor the code so we dont accept any but some types
  the zod validation should be done as a middlewhere in routes
*/

const getUniqueFilters = async (): Promise<AllUniqueKeyAndValuesFilters> => {
  const aggregationPipe = [
    // Unwind the "attributes" array
    { $unwind: "$attributes" },
    {
      $match: {
        "attributes.value": { $exists: true, $ne: [] }, // Exclude empty or missing values
      },
    },

    // Group by "key" and collect all unique "values"
    {
      $group: {
        _id: "$attributes.key", // Group by each unique key in the "attributes"
        value: { $addToSet: "$attributes.value" }, // Collect all arrays of values
      },
    },

    // Flatten the collected values into a single array
    {
      $project: {
        _id: 0, // Exclude the "_id" field
        key: "$_id", // Rename "_id" to "key"
        value: {
          $reduce: {
            input: "$value",
            initialValue: [],
            in: { $concatArrays: ["$$value", "$$this"] },
          },
        }, // Flatten arrays
      },
    },
    {
      $project: {
        key: 1, // Retain the key
        value: { $setUnion: ["$value", []] }, // Use $setUnion to deduplicate
      },
    },
  ];
  const result = await Product.aggregate(aggregationPipe);
  return result;
};
const findNextFiltersProduct = async (filters: QueryFilter) => {
  const aggregationPipeLine: PipelineStage[] = [];
  const stages = createInnerAndOutterMatch(filters);

  const innerOutterStages = {
    outterStage: [{ ...stages[0] }] as PipelineStage.FacetPipelineStage[],
    innerStage: [{ ...stages[1] }] as PipelineStage.FacetPipelineStage[],
  };

  const keys = Object.keys(filters).map((key) => {
    return { "attributes.key": key };
  });

  innerOutterStages.outterStage.push(
    {
      $unwind: "$attributes",
    },
    {
      $unwind: "$attributes.value",
    },
    {
      $group: {
        _id: {
          key: "$attributes.key",
          value: "$attributes.value",
        },
        count: { $sum: 1 },
      },
    },
    {
      $project: {
        _id: 0,
        key: "$_id.key",
        value: "$_id.value",
        count: 1,
      },
    }
  );

  innerOutterStages.innerStage.push(
    {
      $unwind: "$attributes",
    },
    {
      $match: {
        $or: keys,
      },
    },
    {
      $unwind: "$attributes.value",
    },
    {
      $group: {
        _id: {
          key: "$attributes.key",
          value: "$attributes.value",
        },
        count: { $sum: 1 },
      },
    },
    {
      $project: {
        _id: 0,
        key: "$_id.key",
        value: "$_id.value",
        count: 1,
      },
    }
  );
  aggregationPipeLine.push({
    $facet: {
      outterStage: innerOutterStages.outterStage,
      innerStage: innerOutterStages.innerStage,
    },
  });
  let result = await Product.aggregate(aggregationPipeLine);

  result = mergeArrays(result[0].innerStage, result[0].outterStage);

  return result;
};

interface AttributeCount {
  key: string;
  value: string;
  count: number;
}
function mergeArrays(
  arr1: AttributeCount[],
  arr2: AttributeCount[]
): AttributeCount[] {
  const resultMap = new Map<string, AttributeCount>();

  // Helper function to create a unique key for each object based on key and value
  const createKey = (item: AttributeCount) => `${item.key}:${item.value}`;

  // Process both arrays
  [...arr1, ...arr2].forEach((item) => {
    const key = createKey(item);

    if (resultMap.has(key)) {
      const existingItem = resultMap.get(key)!;
      existingItem.count += item.count;
    } else {
      resultMap.set(key, {
        key: item.key,
        value: item.value,
        count: item.count,
      });
    }
  });

  return Array.from(resultMap.values());
}

// const createMatchObjectNextFilters = (input) => {
//   console.time("Original Function Time");
//   const result = { $or: [] };
//   const outterMatch = { $and: [] };
//   const innerMatch = { $or: [] };
//   const entries = Object.entries(input);
//   for (let i = 0; i < entries.length; i++) {
//     const [key, value] = entries[i];
//     outterMatch["$and"].push({
//       attributes: {
//         $elemMatch: { key: key, value: value },
//       },
//     });
//     const currentInnerMatch = { $and: [] };
//     currentInnerMatch["$and"].push({
//       attributes: { $elemMatch: { key: key } },
//     });
//     for (let j = 0; j < entries.length; j++) {
//       if (i === j) {
//         continue;
//       }
//       const [innerKey, innerValue] = entries[j];
//       currentInnerMatch["$and"].push({
//         attributes: {
//           $elemMatch: {
//             key: innerKey,
//             value: innerValue,
//           },
//         },
//       });
//     }
//     innerMatch["$or"].push({ ...currentInnerMatch });
//   }
//   result["$or"].push({ ...outterMatch });
//   result["$or"].push({ ...innerMatch });
//   console.timeEnd("Original Function Time");
//   return { $match: { ...result } };
// };

const createInnerAndOutterMatch = (
  filters: Record<string, { $in: string[] }>
): [PipelineStage, PipelineStage] => {
  const entries = Object.entries(filters);
  // let outterMatch = { $and: [] };
  // let innerMatch = { $or: [] };
  let outterMatch: { $match: { $and: Array<Record<string, any>> } } = {
    $match: { $and: [] },
  };
  let innerMatch: { $match: { $or: Array<Record<string, any>> } } = {
    $match: { $or: [] },
  };

  for (let i = 0; i < entries.length; i++) {
    const [key, value] = entries[i];
    outterMatch.$match.$and.push({
      attributes: {
        $elemMatch: { key: key, value: value },
      },
    });
    // const currentInnerMatch = { $and: [] };
    const currentInnerMatch: { $and: Array<Record<string, any>> } = {
      $and: [],
    };
    currentInnerMatch["$and"].push({
      attributes: { $elemMatch: { key: key } },
    });
    currentInnerMatch["$and"].push({
      attributes: { $not: { $elemMatch: { key: key, value: value } } },
    });
    for (let j = 0; j < entries.length; j++) {
      if (i === j) {
        continue;
      }
      const [innerKey, innerValue] = entries[j];
      currentInnerMatch["$and"].push({
        attributes: {
          $elemMatch: {
            key: innerKey,
            value: innerValue,
          },
        },
      });
    }
    innerMatch.$match.$or.push({ ...currentInnerMatch });
  }
  return [outterMatch, innerMatch];
};

export { create, findNextFiltersProduct, getUniqueFilters };

/*
const findNextFiltersProduct = async (filters) => {
  const aggregationPipeLine = [];
  
  const matchObject = createMatchObjectNextFilters(filters);
  const stages = createInnerAndOutterMatch(filters);
  console.log(JSON.stringify(stages[1]))
  
  // console.log(JSON.stringify(matchObject))
  aggregationPipeLine.push(
    matchObject,
    {
      $unwind: "$attributes",
    },
    {
      $unwind: "$attributes.value",
    },
    {
      $group: {
        _id: {
          key: "$attributes.key",
          value: "$attributes.value",
        },
        count: { $sum: 1 },
      },
    },
    {
      $project: {
        _id: 0,
        key: "$_id.key",
        value: "$_id.value",
        count: 1,
      },
    }
  );
  const result = await Product.aggregate(aggregationPipeLine);
  return result;
};

*/
