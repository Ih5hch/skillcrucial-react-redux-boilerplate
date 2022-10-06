import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import Head from './head'
// import wave from '../assets/images/wave.jpg'

const Home = () => {
  const [user, setUser] = useState(' ')

  const onChange = (name) => {
    setUser(name)
  }

  return (
    <div>
      <Head title="Dashboard" />
      <div className="flex flex-row justify-center w-full p-4">
        <div className="flex flex-col justify-center items-center w-1/2 bg-green-300 border rounded-md font-bold p-4">
          Enter name
          <input type="text" onChange={(e) => onChange(e.target.value)} value={user} />
          <Link
            className="p-2 m-2 bg-indigo-200 rounnded-md font-semibold"
            type="button"
            to={`/${user}`}
          >
            Go!
          </Link>
        </div>
      </div>
    </div>
  )

  // return (
  //   <div>
  //     <Head title="Dashboard" />
  //     <img alt="wave" src="images/wave.jpg" />
  //     <button type="button" onClick={() => setCounterNew(counter + 1)}>
  //       updateCounter
  //     </button>
  //     <div> Hello World Dashboard {counter}
  //     <Link to="/"> Go To Root </Link>
  //     </div>
  //   </div>
  // )
}

Home.propTypes = {}

export default Home
