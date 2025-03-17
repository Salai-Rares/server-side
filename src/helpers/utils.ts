import fs from "fs";
import { Model } from "mongoose";
import { Request } from "express";
import { QueryFilter } from "../types/product";
import EventEmitter from "events";
import { PREDEFINED_FILTERS } from "../constants";
function isObjectEmpty(obj: object) {
  return obj !== null && Object.keys(obj).length === 0;
}

// collectionName should be of type `Collection<any>` for a generic collection
async function logAggregationStages(
  collectionName: Model<any>,
  pipeline: any[]
) {
  let currentPipeline = [];
  let result;
  for (let i = 0; i < pipeline.length; i++) {
    currentPipeline.push(pipeline[i]);
    result = await collectionName.aggregate(currentPipeline);
    writeTextSyncFile(
      "output_server.txt",
      `Stage ${i + 1}: ${JSON.stringify(result, null, 2)}`
    );
  }
  return result;
}
function writeTextSyncFile(fileName: string, text: string) {
  try {
    fs.appendFileSync(fileName, text + "\n");
  } catch (err) {
    console.log("Error writing inside file", err);
  }
}

// Function to build the query object
/*
{
    color:red,
    brand:zara,gucci
}
*/
const buildQueryObject = (
  queryParams: Record<string, string[]>
): QueryFilter => {
  const query: QueryFilter = {};

  // Iterate over each query parameter
  Object.keys(queryParams).forEach((key) => {
    // Add to the query object using $in to match any of the values
    query[key] = { $in: queryParams[key] };
  });

  return query;
};

const splitObjectValuesByComma = (
  queryParams: Record<string, string>
): Record<string, string | string[]> => {
  const query: Record<string, string | string[]> = {};

  // Iterate over each query parameter
  Object.keys(queryParams).forEach((key) => {
    if(PREDEFINED_FILTERS.has(key))
    {
      query[key] = queryParams[key];
    }
    else{
      query[key] = queryParams[key].split(",");
    }
    // Split each value into an array if it contains commas, otherwise wrap it in an array
    

    // Add to the query object using $in to match any of the values
  });
  return query;
};

const escapeSpecialChars = (value: string): string => {
  return value.replace(/[<>&"'`]/g, (char) => {
    const escapeMap: Record<string, string> = {
      "<": "&lt;",
      ">": "&gt;",
      "&": "&amp;",
      '"': "&quot;",
      "'": "&#39;",
      "`": "&#96;",
    };
    return escapeMap[char] || char;
  });
};

const cleanString = (input: string): string => {
  if (!input || typeof input !== "string") return "";
  let result = "";
  result = input.trim().replace(/\s+/g, " "); // Trim & replace multiple spaces with one
  result = result.replace(/[^a-zA-Z0-9-_ ]/g, "");
  return result;
};

const sanitizeValue = (value: unknown): string => {
  if (typeof value === "string") {
    let sanitizedValue = value.trim();
    sanitizedValue = sanitizedValue.toLowerCase();

    // Detect and normalize numeric values
    if (!isNaN(Number(sanitizedValue))) {
      sanitizedValue = Number(sanitizedValue).toString();
    }
    // Escape special characters
    sanitizedValue = escapeSpecialChars(sanitizedValue);

    return sanitizedValue;
  }

  // Fallback for non-string values
  return String(value || "");
};

const sanitizeArray = (array: unknown[]): string => {
  // Sanitize each element in the array and join into a string
  return array.map((item) => sanitizeValue(item)).join(",");
};
const sanitizeQueryRequest = (
  reqQuery: Record<string, unknown>
): Record<string, string> => {
  const sanitizedQueryParams: Record<string, string> = Object.keys(
    reqQuery
  ).reduce((acc, key) => {
    const value = reqQuery[key];

    if (Array.isArray(value)) {
      acc[key] = sanitizeArray(value); // Sanitize arrays
    } else {
      acc[key] = sanitizeValue(value); // Sanitize single values
    }

    return acc;
  }, {} as Record<string, string>);

  return sanitizedQueryParams;
};

export {
  isObjectEmpty,
  logAggregationStages,
  buildQueryObject,
  sanitizeQueryRequest,
  splitObjectValuesByComma,
  cleanString,
};
