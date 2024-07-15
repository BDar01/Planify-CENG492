import React from 'react'

function Step1({formData, handleChange}) {
  return (
    <div>
        <div className="flex flex-col">
								<label
									htmlFor="name"
									className="block mb-1 text-sm font-medium text-gray-900 dark:text-white"
								>
									First Name
								</label>
								<input
									type="text"
									name="name"
									id="name"
									value={formData.name}
									onChange={handleChange}
									className="input-field bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
									placeholder="First Name"
									required
								/>
							</div>
							<div className="flex flex-col">
								<label
									htmlFor="surname"
									className="block mb-1 text-sm font-medium text-gray-900 dark:text-white"
								>
									Last Name
								</label>
								<input
									type="text"
									name="surname"
									id="surname"
									value={formData.surname}
									onChange={handleChange}
									className="input-field bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
									placeholder="Last Name"
									required
								/>
							</div>
							<div className="flex flex-col">
								<label
									htmlFor="email"
									className="block mb-1 text-sm font-medium text-gray-900 dark:text-white"
								>
									Your email
								</label>
								<input
									type="email"
									name="email"
									id="email"
									value={formData.email}
									onChange={handleChange}
									className="input-field bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
									placeholder="name@email.com"
									required
								/>
							</div>
							<div className="flex flex-col">
								<label
									htmlFor="password"
									className="block mb-1 text-sm font-medium text-gray-900 dark:text-white"
								>
									Password
								</label>
								<input
									type="password"
									name="password"
									id="password"
									value={formData.password}
									onChange={handleChange}
									className="input-field bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
									placeholder="••••••••"
									required
								/>
							</div>
    </div>
  )
}

export default Step1