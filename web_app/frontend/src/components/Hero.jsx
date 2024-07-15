import React from 'react'
import HeroImg from '../assets/heroimg.svg'
import { Link } from 'react-router-dom';

function Hero() {
	return (
		<div className='w-full bg-white py-24'>
			<div className='max-w-[1480px] m-auto grid grid-cols-2'>
				<div className='px-5'>
					<p className='py-2 text-lg text-gray-600'>Your very own personal scheduler</p>
					<h1 className='md:text-7xl text-6xl font-semibold'>It's about time.</h1>
					<p className='py-1 text-xl text-[#FF4700]'>Time-wasting is an epidemic. We're here to cure it.</p>

					<p className='py-3 text-lg w-[500px] '>Planify is an AI-powered scheduling solution that is customized to your habits and goals and handles your schedule for you, saving valuable time.
					</p>
					<br />
					<Link to='/signup'>
					<button className='px-8 py-3 rounded-md bg-[#FF4700] text-white font-bold'>Get Started</button>
					</Link>
				</div>
				<img className='md:order-last' src={HeroImg} />

			</div>

		</div>
	)
}

export default Hero