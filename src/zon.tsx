import ReactDOM from 'react-dom';
import 'zone.js';
const obj: any = { name: 1 };
function render() {
  document.getElementById('test').textContent = JSON.stringify(obj);
}
ReactDOM.render(
  <button
    onClick={(e) => {
      fetchData();
    }}
  >
    {JSON.stringify(obj)}
  </button>,
  document.getElementById('root1'),
);

function fetchData() {
  obj.name = obj.name + 1;
  fetch(`/foo.json`)
    .then((res) => {
      return res.json();
    })
    .then((res) => {
      obj.w = res;
    });
}

/*
 * Bind button
 */
function main() {
  //   document.getElementById('test').addEventListener('click', (e) => {
  //     obj.name = obj.name + 1;
  //     fetch(`/foo.json`)
  //       .then((res) => {
  //         return res.json();
  //       })
  //       .then((res) => {
  //         obj.w = res;
  //       });
  //   });
}

/*
 * Bootstrap the app
 */
Zone.current
  .fork({
    name: 'foo',
    onInvokeTask: function (
      delegate,
      current,
      target,
      task,
      applyThis,
      applyArgs,
    ) {
      delegate.invokeTask(target, task, applyThis, applyArgs);
      console.log(obj);
      ReactDOM.render(
        <button>{JSON.stringify(obj)}</button>,
        document.getElementById('root1'),
      );
    },
  })
  .run(main);
