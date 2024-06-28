import {
  createContext as _createContext,
  createElement,
  useContext,
  useEffect,
  useMemo,
  useRef,
} from "react";
import { useSyncExternalStoreWithSelector } from "use-sync-external-store/shim/with-selector";

function generateInitialState(value) {
  return {
    getState: () => value,
    getInitialState: () => value,
    subscribe: () => () => {},
  };
}

function createProvider(Provider) {
  return ({ value, children }) => {
    const ref = useRef();

    if (!ref.current) {
      let state;
      const initialState = (state = value);
      const listeners = new Set();
      const getState = () => state;
      const getInitialState = () => initialState;
      const setState = (nextState) => {
        if (!Object.is(nextState, state)) {
          const previousState = state;
          state = nextState;
          listeners.forEach((listener) => listener(state, previousState));
        }
      };
      const subscribe = (listener) => {
        listeners.add(listener);
        return () => listeners.delete(listener);
      };

      ref.current = { setState, getState, subscribe, getInitialState };
    }

    const contextValues = useMemo(
      () =>
        ref.current
          ? {
              getState: ref.current.getState,
              getInitialState: ref.current.getInitialState,
              subscribe: ref.current.subscribe,
            }
          : generateInitialState(value),
      [ref.current]
    );

    useEffect(() => {
      if (ref.current) {
        ref.current.setState(value);
      } else {
      }
    }, [value]);
    return createElement(Provider, { value: contextValues }, children);
  };
}

function createConsumer(context) {
  return function ({ children, selector = (state) => state }) {
    const values = useContextWithSelector(context, selector);
    return children(values);
  };
}

export function createContext(defaultValue) {
  const _context = _createContext(generateInitialState(defaultValue));
  const context = _context;

  context._Provider = _context.Provider;
  context._Consumer = _context.Consumer;
  context.Provider = createProvider(_context.Provider);
  context.Consumer = createConsumer(context);

  return context;
}

export function useContextWithSelector(context, selector) {
  const { getState, subscribe, getInitialState } = useContext(context);

  return useSyncExternalStoreWithSelector(
    subscribe,
    getState,
    getInitialState,
    selector
  );
}
