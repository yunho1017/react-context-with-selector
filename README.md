# react-context-with-selector

[![npm](https://img.shields.io/npm/v/react-context-with-selector)](https://www.npmjs.com/package/react-context-with-selector)
[![size](https://img.shields.io/bundlephobia/minzip/react-context-with-selector)](https://bundlephobia.com/result?p=react-context-with-selector)

use React Context with selector

## Introduction

When the value of React Context changes, all components that use useContext are re-rendered. This causes unnecessary re-rendering.

Using this library, can solve this issue.

## Install

This package has peer dependencies, which you need to install by yourself.

```bash
// npm
npm install use-context-selector react

// yarn
yarn add use-context-selector react
```

## Usage

```javascript
import { memo, useCallback, useMemo, useState } from "react";
import { createContext } from "react-context-with-selector";

const CountContext = createContext({
  count: 0,
  count2: 0,
  increment: () => {},
  increment2: () => {},
});

const Counter = memo(() => {
  const count = CountContext.useContext((state) => state.count);
  const increment = CountContext.useContext((state) => state.increment);

  return (
    <div>
      <span>Count: {count}</span>
      <button type="button" onClick={increment}>
        increment
      </button>
    </div>
  );
});

const Counter2 = memo(() => {
  const count = CountContext.useContext((state) => state.count2);
  const increment = CountContext.useContext((state) => state.increment2);

  return (
    <div>
      <span>Count: {count}</span>
      <button type="button" onClick={increment}>
        increment
      </button>
    </div>
  );
});

const CounterContainer = () => {
  const [count, setCount] = useState(0);
  const [count2, setCount2] = useState(0);

  const increment = useCallback(() => {
    setCount((_count) => _count + 1);
  }, []);

  const increment2 = useCallback(() => {
    setCount2((_count) => _count + 1);
  }, []);

  const contextValues = useMemo(
    () => ({ count, increment, count2, increment2 }),
    [count, count2, increment, increment2]
  );

  return (
    <CountContext.Provider value={contextValues}>
      <Counter />
      <Counter2 />
    </CountContext.Provider>
  );
};
```
