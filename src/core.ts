import {
  createContext as _createContext,
  createElement,
  useContext,
  useEffect,
  useMemo,
  useRef,
} from "react";
import useSyncExternalStoreExports from "use-sync-external-store/shim/with-selector";
const { useSyncExternalStoreWithSelector } = useSyncExternalStoreExports;

interface State<T> {
  setState: (value: T) => void;
  getState: () => T;
  subscribe: (listener: (state: T, prevState: T) => void) => () => void;
  getInitialState: () => T;
}
type ContextValue<T> = Omit<State<T>, "setState">;

interface Context<T>
  extends Omit<React.Context<ContextValue<T>>, "Provider" | "Consumer"> {
  Provider: React.ComponentType<{
    value: T;
    children: React.ReactNode;
  }>;
  Consumer: React.ComponentType<{
    selector: <R>(state: T) => R;
    children: (values: T) => React.ReactNode;
  }>;
  useContext: <R = T>(selector: (state: T) => R) => R;
  _Provider: React.Context<ContextValue<T>>["Provider"];
  _Consumer: React.Context<ContextValue<T>>["Consumer"];
}

function generateInitialState<T>(value: T) {
  return {
    getState: () => value,
    getInitialState: () => value,
    subscribe: () => () => {},
  };
}

function createProvider<T>(Provider: React.Provider<ContextValue<T>>) {
  return ({ value, children }: { value: T; children: React.ReactNode }) => {
    const ref = useRef<State<T>>();

    if (!ref.current) {
      let state: T;
      const initialState = (state = value);
      const listeners: Set<(state: T, prevState: T) => void> = new Set();
      const getState: State<T>["getState"] = () => state;
      const getInitialState = () => initialState;
      const setState: State<T>["setState"] = (nextState) => {
        if (!Object.is(nextState, state)) {
          const previousState = state;
          state = nextState;
          listeners.forEach((listener) => listener(state, previousState));
        }
      };
      const subscribe: State<T>["subscribe"] = (listener) => {
        listeners.add(listener);
        return () => listeners.delete(listener);
      };

      ref.current = { setState, getState, subscribe, getInitialState };
    }

    const contextValues: ContextValue<T> = useMemo(
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

function createConsumer<T>(context: Context<T>) {
  return function <R = T>({
    children,
    selector = (state: T) => state as unknown as R,
  }: {
    selector: (state: T) => R;
    children: (values: R) => React.ReactNode;
  }) {
    const values = useContextWithSelector(context, selector);
    return children(values);
  };
}

export function createContext<T>(defaultValue: T) {
  const _context = _createContext<ContextValue<T>>(
    generateInitialState(defaultValue)
  );
  const context = _context as unknown as Context<T>;

  context._Provider = _context.Provider;
  context._Consumer = _context.Consumer;
  context.Provider = createProvider(_context.Provider);
  context.Consumer = createConsumer(context);

  context.useContext = function <R = T>(selector: (state: T) => R) {
    return useContextWithSelector(context, selector);
  };

  return context;
}

export function useContextWithSelector<T, R = ContextValue<T>>(
  context: Context<T>,
  selector: (state: T) => R = (state: T) => state as unknown as R
) {
  const { getState, subscribe, getInitialState } = useContext(
    context as unknown as React.Context<ContextValue<T>>
  );

  return useSyncExternalStoreWithSelector<T, ReturnType<typeof selector>>(
    subscribe,
    getState,
    getInitialState,
    selector
  );
}
