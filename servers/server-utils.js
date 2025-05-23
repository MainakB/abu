import { ACTION_HANDLERS } from "./fnMapper.js";

export const mapData = (arg, idx) => {
  const actionType = arg.action === "assert" ? arg.assertion : arg.action;
  const handler = ACTION_HANDLERS[actionType];
  // TO DO if required
  // const updatedStep = step.replace(
  //   /^(?:\*|Given|When|Then)/,
  //   (match) => `${match} ***[mobileWeb]***`
  // );
  if (handler) {
    const result = handler(arg, idx);
    return result || [{ step: `Unable to generate step.` }, idx];
  }

  return [{ step: arg }, idx]; // default fallback
};
