import 'zone.js';
function createElement(type, props, ...children) {
  return {
    type,
    props: {
      ...props,
      children: children.map((child) =>
        typeof child === 'object' ? child : createTextElement(child),
      ),
    },
  };
}

function createTextElement(text) {
  return {
    type: 'TEXT_ELEMENT',
    props: {
      nodeValue: text,
      children: [],
    },
  };
}

const Didact = {
  createElement,
  render,
  useState,
  useService,
};

function createDom(fiber) {
  const dom =
    fiber.type === 'TEXT_ELEMENT'
      ? document.createTextNode('')
      : document.createElement(fiber.type);
  updateDom(dom, {}, fiber.props);
  return dom;
}

function commitRoot() {
  deletions.forEach(commitWork);
  //TODO add nodes to dom
  commitWork(wipRoot.child);
  currentRoot = wipRoot;
  wipRoot = null;
}

const isNew = (prev, next) => (key) => prev[key] !== next[key];

const isGone = (prev, next) => (key) => !(key in next);

const isEvent = (key) => key.startsWith('on');

const isProperty = (key) => key !== 'children' && !isEvent(key);

function updateDom(dom, prevProps, nextProps) {
  //Remove old or changed event listeners
  Object.keys(prevProps)
    .filter(isEvent)
    .filter((key) => !(key in nextProps) || isNew(prevProps, nextProps)(key))
    .forEach((name) => {
      const eventType = name.toLowerCase().substring(2);
      dom.removeEventListener(eventType, prevProps[name]);
    });

  //Remove old properties
  Object.keys(prevProps)
    .filter(isProperty)
    .filter(isGone(prevProps, nextProps))
    .forEach((name) => {
      dom[name] = '';
    });

  // Set new or changed properties
  Object.keys(nextProps)
    .filter(isProperty)
    .filter(isNew(prevProps, nextProps))
    .forEach((name) => {
      dom[name] = nextProps[name];
    });
  Zone.current
    .fork({
      name: 'event',
      onInvokeTask: function (
        delegate,
        current,
        target,
        task,
        applyThis,
        applyArgs,
      ) {
        delegate.invokeTask(target, task, applyThis, applyArgs);
        wipRoot = {
          dom: currentRoot.dom,
          props: currentRoot.props,
          alternate: currentRoot,
        };
        nextUnitOfWork = wipRoot;
        deletions = [];
        console.log('event');
      },
    })
    .run(() => {
      //Add event listeners
      Object.keys(nextProps)
        .filter(isEvent)
        .filter(isNew(prevProps, nextProps))
        .forEach((name) => {
          const eventType = name.toLowerCase().substring(2);
          dom.addEventListener(eventType, nextProps[name]);
        });
    });
  // //Add event listeners
  // Object.keys(nextProps)
  //   .filter(isEvent)
  //   .filter(isNew(prevProps, nextProps))
  //   .forEach((name) => {
  //     const eventType = name.toLowerCase().substring(2);
  //     dom.addEventListener(eventType, nextProps[name]);
  //   });
}

function commitDeletion(fiber, domParent) {
  if (fiber.dom) {
    domParent.removeChild(fiber.dom);
  } else {
    commitDeletion(fiber.child, domParent);
  }
}

function commitWork(fiber) {
  if (!fiber) {
    return;
  }

  let domParentFiber = fiber.parent;

  while (!domParentFiber.dom) {
    domParentFiber = domParentFiber.parent;
  }

  const domParent = domParentFiber.dom;

  if (fiber.effectTag === 'PLACEMENT' && fiber.dom != null) {
    domParent.appendChild(fiber.dom);
  } else if (fiber.effectTag === 'DELETION') {
    commitDeletion(fiber, domParent);
  } else if (fiber.effectTag === 'UPDATE' && fiber.dom != null) {
    updateDom(fiber.dom, fiber.alternate.props, fiber.props);
  }

  commitWork(fiber.child);
  commitWork(fiber.sibling);
}

function render(element, container: HTMLElement) {
  //   element.props.children.forEach((child) => {
  //     render(child, dom);
  //   });
  //   container.appendChild(dom);
  wipRoot = {
    dom: container,
    props: {
      children: [element],
    },
    alternate: currentRoot,
  };
  deletions = [];
  nextUnitOfWork = wipRoot;
}

let nextUnitOfWork = null;
let currentRoot = null;
let wipRoot = null;
let deletions = null;
let wipFiber = null;
let hookIndex = null;
function workLoop(deadline) {
  let shouldYield = false;
  while (nextUnitOfWork && !shouldYield) {
    nextUnitOfWork = performUnitOfWork(nextUnitOfWork);
    shouldYield = deadline.timeRemaining() < 1;
  }

  if (!nextUnitOfWork && wipRoot) {
    commitRoot();
  }

  requestIdleCallback(workLoop);
}

requestIdleCallback(workLoop);

function updateFunctionComponent(fiber) {
  wipFiber = fiber;
  hookIndex = 0;
  wipFiber.hooks = [];
  const children = [fiber.type(fiber.props)];
  reconcileChildren(fiber, children);
}

function useState(initial) {
  const oldHook =
    wipFiber.alternate &&
    wipFiber.alternate.hooks &&
    wipFiber.alternate.hooks[hookIndex];
  const hook = {
    state: oldHook ? oldHook.state : initial,
    queue: [],
  };

  const actions = oldHook ? oldHook.queue : [];
  actions.forEach((action) => {
    hook.state = action(hook.state);
  });

  const setState = (action) => {
    hook.queue.push(action);
    wipRoot = {
      dom: currentRoot.dom,
      props: currentRoot.props,
      alternate: currentRoot,
    };
    nextUnitOfWork = wipRoot;
    deletions = [];
  };

  wipFiber.hooks.push(hook);
  hookIndex++;
  return [hook.state, setState];
}

function useService<T>(initial: () => T): T {
  // const oldHook =
  //   wipFiber.alternate &&
  //   wipFiber.alternate.hooks &&
  //   wipFiber.alternate.hooks[hookIndex];
  // const hook = {
  //   state: oldHook ? oldHook.state : initial,
  //   queue: [],
  // };

  // const actions = oldHook ? oldHook.queue : [];
  // actions.forEach((action) => {
  //   hook.state = action(hook.state);
  // });

  // const setState = (action) => {
  //   hook.queue.push(action);
  //   wipRoot = {
  //     dom: currentRoot.dom,
  //     props: currentRoot.props,
  //     alternate: currentRoot,
  //   };
  //   nextUnitOfWork = wipRoot;
  //   deletions = [];
  // };
  if (wipFiber?.alternate?.service) {
    wipFiber.service = wipFiber?.alternate?.service;
    return wipFiber.service;
  } else {
    const service = initial();
    wipFiber.service = service;
    return service;
  }
}

function updateHostComponent(fiber) {
  // TODO add dom node
  if (!fiber.dom) {
    fiber.dom = createDom(fiber);
  }

  // TODO create new fibers
  const elements = fiber.props.children;
  reconcileChildren(fiber, elements);
}

function performUnitOfWork(fiber) {
  const isFunctionComponent = fiber.type instanceof Function;
  if (isFunctionComponent) {
    updateFunctionComponent(fiber);
  } else {
    updateHostComponent(fiber);
  }

  // TODO return next unit of work
  if (fiber.child) {
    return fiber.child;
  }
  let nextFiber = fiber;
  while (nextFiber) {
    if (nextFiber.sibling) {
      return nextFiber.sibling;
    }

    nextFiber = nextFiber.parent;
  }
}

function reconcileChildren(wipFiber, elements) {
  let index = 0;
  let oldFiber = wipFiber.alternate && wipFiber.alternate.child;
  let prevSibling = null;

  while (index < elements.length || oldFiber != null) {
    const element = elements[index];

    //TODO compare oldFiber to element

    let newFiber = null;

    const sameType = oldFiber && element && element.type === oldFiber.type;
    if (sameType) {
      //TODO update the node
      newFiber = {
        type: oldFiber.type,
        props: element.props,
        dom: oldFiber.dom,
        parent: wipFiber,
        alternate: oldFiber,
        effectTag: 'UPDATE',
      };
    }

    if (element && !sameType) {
      //TODO add this node
      newFiber = {
        type: element.type,
        props: element.props,
        dom: null,
        parent: wipFiber,
        alternate: null,
        effectTag: 'PLACEMENT',
      };
    }

    if (oldFiber && !sameType) {
      //TODO delete the oldFiber's node
      oldFiber.effectTag = 'DELETION';
      deletions.push(oldFiber);
    }

    if (oldFiber) {
      oldFiber = oldFiber.sibling;
    }

    if (index === 0) {
      wipFiber.child = newFiber;
    } else {
      prevSibling.sibling = newFiber;
    }

    prevSibling = newFiber;
    index++;
  }
}

class Service {
  name = 'xiaoxiaolu';
  data = { fff: 0 };
  add() {
    this.name = this.name + '1';
  }
  fetchData() {
    fetch(`/foo.json`)
      .then((res) => {
        return res.json();
      })
      .then((res) => {
        this.data = res;
        this.data.fff = Date.now();
      });
  }
  constructor() {}
}

function App(props) {
  // const [age, setAge] = Didact.useState(0);
  const service = useService(() => new Service());
  return (
    <div>
      <button
        onClick={(e) => {
          service.add();
          service.fetchData();
        }}
      >
        +
      </button>
      hi {service.name} {JSON.stringify(service.data)}
    </div>
  );
}

const element = <App name="123" />;
const container = document.getElementById('root');
Didact.render(element, container);
// const updateValue = (e) => {
//   rerender(e.target.value);
// };

// const rerender = (value) => {
//   const element = (
//     <div>
//       <input onInput={updateValue} value={value} />
//       <h2>Hello {value}</h2>
//     </div>
//   );
//   Didact.render(element, container);
// };

// rerender('World');
