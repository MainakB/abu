import { ACTION_HANDLERS } from "./fnMapper.js";

export const mapData = (arg, idx) => {
  const actionType = arg.action === "assert" ? arg.assertion : arg.action;
  const handler = ACTION_HANDLERS[actionType];

  if (handler) {
    return handler(arg, idx);
  }

  return [{ step: arg }, idx]; // default fallback
};
