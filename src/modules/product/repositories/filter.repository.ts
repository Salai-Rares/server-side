import { PipelineStage } from "mongoose";
import {
  AllUniqueKeyAndValuesFilters,
  KeyValueCountFilter,
  QueryFilter,
  QueryFiltersObject
} from "../types/product-query-filter.types";
import { IFilterRepository } from "../types/filter.repository.types";
import Product from "../models/product";
import { injectable } from "inversify";
import { isTruthy } from "../../../helpers";
import { buildQueryObject } from "../../../helpers/utils";
/**
 * Implementation of {@link IFilterRepository} using MongoDB.
 */
@injectable()
class FilterRepository implements IFilterRepository {
  /**
   * @inheritdoc
   */
  async getUniqueFilters(): Promise<AllUniqueKeyAndValuesFilters> {
    const aggregationPipe: PipelineStage[] = [
      { $unwind: "$attributes" },
      {
        $match: {
          "attributes.value": { $exists: true, $ne: [] },
        },
      },
      {
        $group: {
          _id: "$attributes.key",
          value: { $addToSet: "$attributes.value" },
        },
      },
      {
        $project: {
          _id: 0,
          key: "$_id",
          value: {
            $reduce: {
              input: "$value",
              initialValue: [],
              in: { $concatArrays: ["$$value", "$$this"] },
            },
          },
        },
      },
      {
        $project: {
          key: 1,
          value: { $setUnion: ["$value", []] },
        },
      },
    ];

    return await Product.aggregate(aggregationPipe);
  }

  /**
   * @inheritdoc
   */
  async findNextFiltersProduct(
    filterObject: QueryFiltersObject
  ): Promise<KeyValueCountFilter[]> {
    // const { filters, category } = filterObject;
    // if (category) {
    //   console.log("Implement the category functionality!");
    // }
    const aggregationPipeline: PipelineStage[] = [];
    console.log('findNextFiltersProduct:',JSON.stringify(filterObject))
    //modified filterObject instead of filters
    const dynamicFilters = filterObject.attributes;
    if (isTruthy(dynamicFilters)) {
      const formattedDyanamic = buildQueryObject(dynamicFilters)
      const stages = this.createInnerAndOuterMatch(formattedDyanamic);

      const innerOuterStages = {
        outerStage: [{ ...stages[0] }] as PipelineStage.FacetPipelineStage[],
        innerStage: [{ ...stages[1] }] as PipelineStage.FacetPipelineStage[],
      };

      const keys = Object.keys(filterObject.attributes).map((key) => ({
        "attributes.key": key,
      }));

      innerOuterStages.outerStage.push(
        { $unwind: "$attributes" },
        { $unwind: "$attributes.value" },
        {
          $group: {
            _id: { key: "$attributes.key", value: "$attributes.value" },
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

      innerOuterStages.innerStage.push(
        { $unwind: "$attributes" },
        {
          $match: {
            $or: keys,
          },
        },
        { $unwind: "$attributes.value" },
        {
          $group: {
            _id: { key: "$attributes.key", value: "$attributes.value" },
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
      const initialMatch : {$match:{$or:{"attributes.key":string}[]}} = {$match:{$or:[]}}
      //here
      initialMatch.$match.$or.push(...keys)
      console.log(JSON.stringify(initialMatch))
      aggregationPipeline.push(
        
        {
        $facet: {
          outerStage: innerOuterStages.outerStage,
          innerStage: innerOuterStages.innerStage,
        },
      });

      let result = await Product.aggregate(aggregationPipeline);

      result = this.mergeArrays(result[0].innerStage, result[0].outerStage);
      return result;
    }
    return []
  
  }

  /**
   * Create matching stages for aggregation.
   * @param filters The input query filters.
   * @returns The outer and inner match stages.
   */
  private createInnerAndOuterMatch(
    filters: Record<string, { $in: string[] }>
  ): [PipelineStage, PipelineStage] {
    const entries = Object.entries(filters);

    const outerMatch: { $match: { $and: Array<Record<string, any>> } } = {
      $match: { $and: [] },
    };

    const innerMatch: { $match: { $or: Array<Record<string, any>> } } = {
      $match: { $or: [] },
    };

    for (let i = 0; i < entries.length; i++) {
      const [key, value] = entries[i];
      outerMatch.$match.$and.push({
        attributes: {
          $elemMatch: { key: key, value: value },
        },
      });

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
            $elemMatch: { key: innerKey, value: innerValue },
          },
        });
      }

      innerMatch.$match.$or.push({ ...currentInnerMatch });
    }

    return [outerMatch, innerMatch];
  }

  /**
   * Merge two arrays of attribute counts, summing their counts for duplicates.
   * @param arr1 The first array of attribute counts.
   * @param arr2 The second array of attribute counts.
   * @returns The merged array.
   */
  private mergeArrays(
    arr1: KeyValueCountFilter[],
    arr2: KeyValueCountFilter[]
  ): KeyValueCountFilter[] {
    const resultMap = new Map<string, KeyValueCountFilter>();

    const createKey = (item: KeyValueCountFilter) =>
      `${item.key}:${item.value}`;

    [...arr1, ...arr2].forEach((item) => {
      const key = createKey(item);

      if (resultMap.has(key)) {
        const existingItem = resultMap.get(key)!;
        existingItem.count += item.count;
      } else {
        resultMap.set(key, { ...item });
      }
    });

    return Array.from(resultMap.values());
  }
}
export default FilterRepository;
