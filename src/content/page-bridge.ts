import {
  EXECUTE_PAGE_FUNCTION_EVENT,
  PAGE_FUNCTION_RESULT_EVENT,
} from '@/shared/types';
import type {
  ExecutePageFunctionEventDetail,
  PageFunctionResultEventDetail,
} from '@/shared/types';

const FUNCTION_PATH_PATTERN = /^[A-Za-z_$][\w$]*(?:\.[A-Za-z_$][\w$]*)*$/;

function invokePageFunction(functionPath: string): void {
  if (!FUNCTION_PATH_PATTERN.test(functionPath)) {
    throw new Error('Invalid page function path');
  }

  const pathSegments = functionPath.split('.');
  const functionName = pathSegments.pop();
  let receiver: object = window;

  for (const pathSegment of pathSegments) {
    const nextReceiver = Reflect.get(receiver, pathSegment) as unknown;
    if (
      nextReceiver === null
      || (typeof nextReceiver !== 'object' && typeof nextReceiver !== 'function')
    ) {
      throw new Error(`Page object not found: ${pathSegment}`);
    }
    receiver = nextReceiver as object;
  }

  const pageFunction = functionName === undefined
    ? undefined
    : Reflect.get(receiver, functionName) as unknown;
  if (typeof pageFunction !== 'function') {
    throw new Error(`Page function not found: ${functionPath}`);
  }

  Reflect.apply(pageFunction, receiver, []);
}

document.addEventListener(EXECUTE_PAGE_FUNCTION_EVENT, (event) => {
  const { requestId, functionPath } = (
    event as CustomEvent<ExecutePageFunctionEventDetail>
  ).detail;
  let result: PageFunctionResultEventDetail;

  try {
    invokePageFunction(functionPath);
    result = { requestId, success: true };
  } catch (error) {
    result = { requestId, success: false, error: String(error) };
  }

  document.dispatchEvent(new CustomEvent(PAGE_FUNCTION_RESULT_EVENT, {
    detail: result,
  }));
});
