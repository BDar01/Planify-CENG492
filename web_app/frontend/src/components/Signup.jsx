import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./signup.css"; // Import your CSS file
import plogo from "../assets/plogo.png";
import TimeRangeSlider from "./TimeRangeSlider";
import Step1 from "./Step1";
import Step2 from "./Step2";
import Step3 from "./Step3";
function SignUp() {
	const navigate = useNavigate();
	const [currentStep, setCurrentStep] = useState(1);

	const [formData, setFormData] = useState({
		name: "",
		surname: "",
		email: "",
		password: "",
		role: "",
		balanced: "",
		activeHoursStart: 7,
		activeHoursEnd: 21,
	});

	const handleChange = (e) => {
		e.preventDefault();
		console.log(e.target);
		const { name, value } = e.target;
		setFormData((prevData) => ({
			...prevData,
			[name]: value,
		}));
	};

	const onActiveHoursChange = (start, end) => {
		
        // Update the formData state with the new active hours values
        setFormData((prevData) => ({
            ...prevData,
            activeHoursStart: start,
            activeHoursEnd: end,
        }));
    };
	const renderFormSteps = () => {
		if (currentStep===1){
			return (
				<Step1 formData={formData} handleChange={handleChange} />
			);

		}
		else if (currentStep===2){
			return (
				<Step2 formData={formData} handleChange={handleChange} />
			);
		}
		else {
			return (
				<Step3 formData={formData} handleChange={handleChange} onActiveHoursChange={onActiveHoursChange} />
			);

		}

        
    };


	const handleSubmit = async (e) => {
		e.preventDefault();
		console.log(formData);
		try {
			const response = await fetch("http://localhost:5000/signup", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify(formData),
			});
			if (response.ok) {
				// User successfully registered
				// Redirect or show success message
				console.log("User successfully registered");
				localStorage.setItem("userName", formData.name);
				//navigate("/dashboard");
				navigate("/signin");

			} else {
				// Error handling
				const data = await response.json();
				console.error("Error:", data.error);
			}
		} catch (error) {
			console.error("Error:", error);
		}
	};

	
	return (
		<section className="bg-gray-50 dark:bg-gray-900">
			<div className="flex flex-col items-center justify-center px-6 py-5 mx-auto md:h-screen lg:py-0">
				<div>
					<a
						href="#"
						className="flex items-center mt-8 mb-4 text-3xl font-semibold text-gray-900 dark:text-white"
					>
						<img className="w-10 h-10 mr-2" src={plogo} alt="logo" />
						Planify
					</a>
				</div>
				<div className="w-full max-w-md bg-white rounded-lg shadow dark:border dark:bg-gray-800 dark:border-gray-700">
					<div className="p-6 space-y-4 md:p-8">
						
							{renderFormSteps()}
                            
                            {/* Navigation buttons */}
                            {currentStep > 1 && (
                                <button
                                    className="btn-primary"
                                    type="button"
                                    onClick={() => setCurrentStep(currentStep - 1)}
                                >
                                    Previous
                                </button>
                            )}
                            {currentStep < 3 ? (
                                <button
                                    className="btn-primary"
                                    type="button"
                                    onClick={() => setCurrentStep(currentStep + 1)}
                                >
                                    Next
                                </button>
                            ) : (
                                <button
                                    className="btn-primary"
                                    type="submit"
									onClick={handleSubmit}
                                >
                                    Submit
                                </button>
                            )}
							

					
					</div>
				</div>
				
			</div>
		</section>
	);
}

export default SignUp;
