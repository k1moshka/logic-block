import { Block, BlockFactory, isBlock } from "../block";
import { merge } from "../internal/merge";

export const extend = (
  ...configs: Array<Record<string, any> | BlockFactory>
) => {
  const result = {};
  for (const config of configs) {
    if (isBlock(config)) {
      merge(result, config.__getScheme());
    } else if (typeof config === "object") {
      merge(result, config);
    }
  }
  return Block(result);
};
