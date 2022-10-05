import React from 'react'
import { Link, useParams } from 'react-router-dom'
import Head from './head'

const Dummy = () => {
  const { planetId } = useParams()
  return (
    <div>
      <Head title="Hello" />
      <div className="flex justify-center items-center h-screen">
        <div className="flex flex-col justify-center bg-indigo-800 p-10 rounded-xl select-none">
          <img alt="wave" src="images/logo-new-text.png" />
          <span className="text-white text-right font-semibold">Boilerplate</span>
          <Link to="/dashboard">Dashboard</Link>
          <div>this is {planetId}</div>
        </div>
      </div>
    </div>
  )
}

Dummy.propTypes = {}

export default React.memo(Dummy)
