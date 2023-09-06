import getPath from "lodash/get";
import setPath from "lodash/set";

import { merge } from "./merge";
import { isBlock } from "../block";
import { isFieldReducer } from "../createFieldReducer";
import { HandlerInstance } from "../handler";

const buildPath = (...args: Array<string>) => args.filter(Boolean).join(".");

export const SchemeRenderer = (
  scheme: Record<string, any>,
  initialValue: Record<string, any>,
  handlerInstance: HandlerInstance
) => {
  // rendering time code
  const blocks = {};

  return (
    newValue: Record<string, any>,
    oldValue?: Record<string, any>,
    path?: string
  ) => {
    const result = merge({}, oldValue, newValue);

    const renderSchemePart = (part: Record<string, any>, basePath?: string) => {
      for (const key of Object.keys(part)) {
        const entry = part[key];
        const fullPath = buildPath(path, basePath, key);

        if (typeof entry === "function") {
          if (isFieldReducer(entry)) {
            setPath(
              result,
              fullPath,
              entry(result, oldValue, fullPath, handlerInstance)
            );
          } else if (isBlock(entry)) {
            if (!blocks[fullPath]) {
              const partialOldValue = getPath(oldValue, fullPath);
              blocks[fullPath] = entry(partialOldValue);
            }

            const partialNewValue = getPath(result, fullPath);
            setPath(
              result,
              fullPath,
              blocks[fullPath](partialNewValue, fullPath, handlerInstance)
            );
          } else {
            setPath(result, fullPath, entry());
          }
        } else if (typeof entry === "object" && entry !== null) {
          if (Array.isArray(entry)) {
            entry.forEach(() => renderSchemePart(entry, key));
          } else {
            renderSchemePart(entry, key);
          }
        } else {
          setPath(result, fullPath, entry);
        }
      }
    };

    renderSchemePart(scheme);

    return result;
  };
};
