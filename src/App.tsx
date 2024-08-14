import { useState } from 'react';
import { ThreeCanvas } from './components/ThreeCanvas'

function App() {
  const [count, setCount] = useState(0);
  
  return (
    <>
      <ThreeCanvas testCount={count} />
      <button onClick={() => setCount((count) => count + 1)}>
        count is {count}
      </button>
    </>
  )
}

export default App
