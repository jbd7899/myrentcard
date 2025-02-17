import React, { useState, useEffect } from 'react';
import { ChevronRight, User, Home, Briefcase, CreditCard } from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';
import { useLocation } from 'wouter';

type Pet = {
  type: string;
  breed: string;
  weight: string;
  age: string;
};

type FormData = {
  personalInfo: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    dateOfBirth: string;
    hasPets: boolean;
    pets: Pet[];
  };
  rentalHistory: {
    currentAddress: string;
    currentRent: string;
    movingFromOutOfState: boolean;
    hasLandlordReferences: boolean;
    currentLandlord: {
      name: string;
      phone: string;
      email: string;
    };
    hasEvictions: boolean;
    evictionDetails: string;
    hasUnpaidBills: boolean;
    unpaidBillsDetails: string;
  };
  employment: {
    employer: string;
    position: string;
    monthlyIncome: string;
    yearsInJob: string;
    hasPayStubs: boolean;
    hasBankStatements: boolean;
  };
  rentalPreferences: {
    isFlexibleDates: boolean;
    flexibleMonths: string[];
    desiredMoveInDate: string;
    maxRent: string;
    preferredLocations: string;
    hasRoommates: boolean;
    needsCosigner: boolean;
  };
};

export default function RentCardForm() {
  const [step, setStep] = useState(1);
  const [progress, setProgress] = useState(0);
  const [isComplete, setIsComplete] = useState(false);
  const { user } = useAuth();
  const [, setLocation] = useLocation();

  const sectionTitles: Record<number, string> = {
    1: "Personal Information",
    2: "Rental History",
    3: "Income",
    4: "Rental Preferences",
    5: "Complete Your RentCard"
  };

  const [formData, setFormData] = useState<FormData>({
    personalInfo: {
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      dateOfBirth: '',
      hasPets: false,
      pets: []
    },
    rentalHistory: {
      currentAddress: '',
      currentRent: '',
      movingFromOutOfState: false,
      hasLandlordReferences: false,
      currentLandlord: {
        name: '',
        phone: '',
        email: ''
      },
      hasEvictions: false,
      evictionDetails: '',
      hasUnpaidBills: false,
      unpaidBillsDetails: ''
    },
    employment: {
      employer: '',
      position: '',
      monthlyIncome: '',
      yearsInJob: '',
      hasPayStubs: false,
      hasBankStatements: false
    },
    rentalPreferences: {
      isFlexibleDates: false,
      flexibleMonths: [],
      desiredMoveInDate: '',
      maxRent: '',
      preferredLocations: '',
      hasRoommates: false,
      needsCosigner: false
    }
  });

  useEffect(() => {
    const calculateProgress = () => {
      if (isComplete) {
        setProgress(100);
        return;
      }
      // Calculate based on current step
      setProgress(Math.min(((step - 1) / 4) * 100, 75));
    };

    calculateProgress();
  }, [step, isComplete]);

  const handleInputChange = (section: keyof FormData, field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value
      }
    }));
  };

  const renderPetForm = () => (
    <div className="mt-4 p-4 bg-gray-50 rounded-lg">
      <h3 className="text-lg font-medium mb-4">Pet Information</h3>
      <button
        type="button"
        onClick={() => {
          setFormData(prev => ({
            ...prev,
            personalInfo: {
              ...prev.personalInfo,
              pets: [...prev.personalInfo.pets, { type: '', breed: '', weight: '', age: '' }]
            }
          }));
        }}
        className="px-4 py-2 bg-blue-600 text-white rounded-lg mb-4"
      >
        Add Pet
      </button>
      {formData.personalInfo.pets.map((pet, index) => (
        <div key={index} className="grid grid-cols-4 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium mb-2">Pet Type</label>
            <input
              type="text"
              className="w-full p-2 border rounded-lg"
              value={pet.type}
              onChange={(e) => {
                const newPets = [...formData.personalInfo.pets];
                newPets[index].type = e.target.value;
                handleInputChange('personalInfo', 'pets', newPets);
              }}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Breed</label>
            <input
              type="text"
              className="w-full p-2 border rounded-lg"
              value={pet.breed}
              onChange={(e) => {
                const newPets = [...formData.personalInfo.pets];
                newPets[index].breed = e.target.value;
                handleInputChange('personalInfo', 'pets', newPets);
              }}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Weight (lbs)</label>
            <input
              type="number"
              className="w-full p-2 border rounded-lg"
              value={pet.weight}
              onChange={(e) => {
                const newPets = [...formData.personalInfo.pets];
                newPets[index].weight = e.target.value;
                handleInputChange('personalInfo', 'pets', newPets);
              }}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Age (years)</label>
            <input
              type="number"
              className="w-full p-2 border rounded-lg"
              value={pet.age}
              onChange={(e) => {
                const newPets = [...formData.personalInfo.pets];
                newPets[index].age = e.target.value;
                handleInputChange('personalInfo', 'pets', newPets);
              }}
            />
          </div>
        </div>
      ))}
    </div>
  );

  const renderStep = () => {
    switch(step) {
      case 1:
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">First Name</label>
                <input
                  type="text"
                  className="w-full p-2 border rounded-lg"
                  value={formData.personalInfo.firstName}
                  onChange={(e) => handleInputChange('personalInfo', 'firstName', e.target.value)}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Last Name</label>
                <input
                  type="text"
                  className="w-full p-2 border rounded-lg"
                  value={formData.personalInfo.lastName}
                  onChange={(e) => handleInputChange('personalInfo', 'lastName', e.target.value)}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Email</label>
                <input
                  type="email"
                  className="w-full p-2 border rounded-lg"
                  value={formData.personalInfo.email}
                  onChange={(e) => handleInputChange('personalInfo', 'email', e.target.value)}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Phone</label>
                <input
                  type="tel"
                  className="w-full p-2 border rounded-lg"
                  value={formData.personalInfo.phone}
                  onChange={(e) => handleInputChange('personalInfo', 'phone', e.target.value)}
                />
              </div>
              <div className="col-span-2">
                <label className="block text-sm font-medium mb-2">Do you have pets?</label>
                <div className="flex gap-4">
                  <button
                    type="button"
                    className={`px-4 py-2 rounded-lg ${formData.personalInfo.hasPets ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}
                    onClick={() => handleInputChange('personalInfo', 'hasPets', true)}
                  >
                    Yes
                  </button>
                  <button
                    type="button"
                    className={`px-4 py-2 rounded-lg ${!formData.personalInfo.hasPets ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}
                    onClick={() => handleInputChange('personalInfo', 'hasPets', false)}
                  >
                    No
                  </button>
                </div>
              </div>
            </div>
            {formData.personalInfo.hasPets && renderPetForm()}
          </div>
        );

      case 2:
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <label className="block text-sm font-medium mb-2">Current Address</label>
                <input
                  type="text"
                  className="w-full p-2 border rounded-lg"
                  value={formData.rentalHistory.currentAddress}
                  onChange={(e) => handleInputChange('rentalHistory', 'currentAddress', e.target.value)}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Current Monthly Rent</label>
                <input
                  type="number"
                  className="w-full p-2 border rounded-lg"
                  value={formData.rentalHistory.currentRent}
                  onChange={(e) => handleInputChange('rentalHistory', 'currentRent', e.target.value)}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Moving from out of state?</label>
                <div className="flex gap-4">
                  <button
                    type="button"
                    className={`px-4 py-2 rounded-lg ${formData.rentalHistory.movingFromOutOfState ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}
                    onClick={() => handleInputChange('rentalHistory', 'movingFromOutOfState', true)}
                  >
                    Yes
                  </button>
                  <button
                    type="button"
                    className={`px-4 py-2 rounded-lg ${!formData.rentalHistory.movingFromOutOfState ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}
                    onClick={() => handleInputChange('rentalHistory', 'movingFromOutOfState', false)}
                  >
                    No
                  </button>
                </div>
              </div>
              <div className="col-span-2">
                <label className="block text-sm font-medium mb-2">Any evictions?</label>
                <div className="flex gap-4 mb-4">
                  <button
                    type="button"
                    className={`px-4 py-2 rounded-lg ${formData.rentalHistory.hasEvictions ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}
                    onClick={() => handleInputChange('rentalHistory', 'hasEvictions', true)}
                  >
                    Yes
                  </button>
                  <button
                    type="button"
                    className={`px-4 py-2 rounded-lg ${!formData.rentalHistory.hasEvictions ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}
                    onClick={() => handleInputChange('rentalHistory', 'hasEvictions', false)}
                  >
                    No
                  </button>
                </div>
                {formData.rentalHistory.hasEvictions && (
                  <textarea
                    className="w-full p-2 border rounded-lg"
                    placeholder="Please provide details about the eviction..."
                    value={formData.rentalHistory.evictionDetails}
                    onChange={(e) => handleInputChange('rentalHistory', 'evictionDetails', e.target.value)}
                  />
                )}
              </div>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <label className="block text-sm font-medium mb-2">Current Employer</label>
                <input
                  type="text"
                  className="w-full p-2 border rounded-lg"
                  value={formData.employment.employer}
                  onChange={(e) => handleInputChange('employment', 'employer', e.target.value)}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Years in Current Job</label>
                <input
                  type="number"
                  className="w-full p-2 border rounded-lg"
                  value={formData.employment.yearsInJob}
                  onChange={(e) => handleInputChange('employment', 'yearsInJob', e.target.value)}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Monthly Income</label>
                <input
                  type="number"
                  className="w-full p-2 border rounded-lg"
                  value={formData.employment.monthlyIncome}
                  onChange={(e) => handleInputChange('employment', 'monthlyIncome', e.target.value)}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Can provide pay stubs?</label>
                <div className="flex gap-4">
                  <button
                    type="button"
                    className={`px-4 py-2 rounded-lg ${formData.employment.hasPayStubs ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}
                    onClick={() => handleInputChange('employment', 'hasPayStubs', true)}
                  >
                    Yes
                  </button>
                  <button
                    type="button"
                    className={`px-4 py-2 rounded-lg ${!formData.employment.hasPayStubs ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}
                    onClick={() => handleInputChange('employment', 'hasPayStubs', false)}
                  >
                    No
                  </button>
                </div>
              </div>
              {!formData.employment.hasPayStubs && (
                <div>
                  <label className="block text-sm font-medium mb-2">Can provide bank statements?</label>
                  <div className="flex gap-4">
                    <button
                      type="button"
                      className={`px-4 py-2 rounded-lg ${formData.employment.hasBankStatements ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}
                      onClick={() => handleInputChange('employment', 'hasBankStatements', true)}
                    >
                      Yes
                    </button>
                    <button
                      type="button"
                      className={`px-4 py-2 rounded-lg ${!formData.employment.hasBankStatements ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}
                      onClick={() => handleInputChange('employment', 'hasBankStatements', false)}
                    >
                      No
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <label className="block text-sm font-medium mb-2">Move-in Date Preference</label>
                <div className="flex gap-4 mb-4">
                  <button
                    type="button"
                    className={`px-4 py-2 rounded-lg ${!formData.rentalPreferences.isFlexibleDates ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}
                    onClick={() => handleInputChange('rentalPreferences', 'isFlexibleDates', false)}
                  >
                    Specific Date
                  </button>
                  <button
                    type="button"
                    className={`px-4 py-2 rounded-lg ${formData.rentalPreferences.isFlexibleDates ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}
                    onClick={() => handleInputChange('rentalPreferences', 'isFlexibleDates', true)}
                  >
                    I'm Flexible
                  </button>
                </div>
                {!formData.rentalPreferences.isFlexibleDates ? (
                  <input
                    type="date"
                    className="w-full p-2 border rounded-lg"
                    value={formData.rentalPreferences.desiredMoveInDate}
                    onChange={(e) => handleInputChange('rentalPreferences', 'desiredMoveInDate', e.target.value)}
                  />
                ) : (
                  <div className="grid grid-cols-2 gap-4">
                    {['January', 'February', 'March', 'April', 'May', 'June',
                      'July', 'August', 'September', 'October', 'November', 'December'].map((month) => (
                      <button
                        key={month}
                        type="button"
                        className={`p-2 rounded-lg ${
                          formData.rentalPreferences.flexibleMonths.includes(month)
                            ? 'bg-blue-600 text-white'
                            : 'bg-gray-100'
                        }`}
                        onClick={() => {
                          const months = formData.rentalPreferences.flexibleMonths;
                          if (months.includes(month)) {
                            handleInputChange(
                              'rentalPreferences',
                              'flexibleMonths',
                              months.filter((m) => m !== month)
                            );
                          } else if (months.length < 4) {
                            handleInputChange(
                              'rentalPreferences',
                              'flexibleMonths',
                              [...months, month]
                            );
                          }
                        }}
                        disabled={
                          !formData.rentalPreferences.flexibleMonths.includes(month) &&
                          formData.rentalPreferences.flexibleMonths.length >= 4
                        }
                      >
                        {month}
                      </button>
                    ))}
                  </div>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Maximum Monthly Rent</label>
                <input
                  type="number"
                  className="w-full p-2 border rounded-lg"
                  value={formData.rentalPreferences.maxRent}
                  onChange={(e) => handleInputChange('rentalPreferences', 'maxRent', e.target.value)}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Will you have roommates?</label>
                <div className="flex gap-4">
                  <button
                    type="button"
                    className={`px-4 py-2 rounded-lg ${formData.rentalPreferences.hasRoommates ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}
                    onClick={() => handleInputChange('rentalPreferences', 'hasRoommates', true)}
                  >
                    Yes
                  </button>
                  <button
                    type="button"
                    className={`px-4 py-2 rounded-lg ${!formData.rentalPreferences.hasRoommates ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}
                    onClick={() => handleInputChange('rentalPreferences', 'hasRoommates', false)}
                  >
                    No
                  </button>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Will you need a co-signer?</label>
                <div className="flex gap-4">
                  <button
                    type="button"
                    className={`px-4 py-2 rounded-lg ${formData.rentalPreferences.needsCosigner ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}
                    onClick={() => handleInputChange('rentalPreferences', 'needsCosigner', true)}
                  >
                    Yes
                  </button>
                  <button
                    type="button"
                    className={`px-4 py-2 rounded-lg ${!formData.rentalPreferences.needsCosigner ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}
                    onClick={() => handleInputChange('rentalPreferences', 'needsCosigner', false)}
                  >
                    No
                  </button>
                </div>
              </div>
            </div>
          </div>
        );

      case 5:
        const handleShareWithoutAccount = () => {
          const sharingId = Math.random().toString(36).substring(2, 15);
          window.alert(`Your RentCard has been created! Share this link: myrentcard.com/share/${sharingId}`);
        };

        const handleCreateAccount = () => {
          localStorage.setItem('pendingRentCardData', JSON.stringify(formData));
          setLocation('/auth?from=tenant-flow');
        };
        return (
          <div className="space-y-6 text-center">
            <div className="mb-12">
              <div className="flex justify-center mb-4">
                <div className="bg-green-100 rounded-full p-4">
                  <svg className="w-12 h-12 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                  </svg>
                </div>
              </div>
              <h2 className="text-3xl font-bold mb-4">Your RentCard is Ready!</h2>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                You're now ready to streamline your rental search. Your RentCard contains all the information landlords need to fast-track your application.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
              <div className="bg-white p-8 rounded-xl shadow-lg border border-gray-100 hover:shadow-xl transition-shadow">
                <div className="mb-6">
                  <h3 className="text-xl font-semibold mb-4">Share Now</h3>
                  <p className="text-gray-600 mb-6">
                    Start using your RentCard immediately without creating an account. Perfect for one-time use.
                  </p>
                  <ul className="text-left text-gray-600 space-y-3 mb-6">
                    <li className="flex items-center">
                      <svg className="w-5 h-5 text-blue-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                      </svg>
                      Send to landlords instantly
                    </li>
                    <li className="flex items-center">
                      <svg className="w-5 h-5 text-blue-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                      </svg>
                      No account required
                    </li>
                  </ul>
                </div>
                <button
                  onClick={handleShareWithoutAccount}
                  className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Share RentCard Now
                </button>
              </div>

              <div className="bg-white p-8 rounded-xl shadow-lg border border-gray-100 hover:shadow-xl transition-shadow">
                <div className="mb-6">
                  <div className="inline-block bg-blue-100 text-blue-600 px-3 py-1 rounded-full text-sm font-medium mb-4">
                    Recommended
                  </div>
                  <h3 className="text-xl font-semibold mb-4">Create Free Account</h3>
                  <p className="text-gray-600 mb-6">
                    Save your RentCard and access premium features to make your rental search even easier.
                  </p>
                  <ul className="text-left text-gray-600 space-y-3 mb-6">
                    <li className="flex items-center">
                      <svg className="w-5 h-5 text-blue-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                      </svg>
                      Save & update your RentCard anytime
                    </li>
                    <li className="flex items-center">
                      <svg className="w-5 h-5 text-blue-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                      </svg>
                      Track application status
                    </li>
                    <li className="flex items-center">
                      <svg className="w-5 h-5 text-blue-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                      </svg>
                      Build your rental history
                    </li>
                  </ul>
                </div>
                <button
                  onClick={handleCreateAccount}
                  className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Create Free Account
                </button>
              </div>
            </div>

            <div className="max-w-2xl mx-auto bg-gray-50 p-6 rounded-lg">
              <h3 className="text-lg font-semibold mb-4">How to Use Your RentCard</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center p-4">
                  <div className="text-blue-600 font-bold text-xl mb-2">1</div>
                  <p className="text-gray-600">Share your RentCard link with landlords via email or text</p>
                </div>
                <div className="text-center p-4">
                  <div className="text-blue-600 font-bold text-xl mb-2">2</div>
                  <p className="text-gray-600">Landlords review your complete rental profile instantly</p>
                </div>
                <div className="text-center p-4">
                  <div className="text-blue-600 font-bold text-xl mb-2">3</div>
                  <p className="text-gray-600">Get pre-approved faster and secure your dream rental</p>
                </div>
              </div>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  const icons = [
    <User key="user" className="w-6 h-6" />,
    <Home key="home" className="w-6 h-6" />,
    <Briefcase key="briefcase" className="w-6 h-6" />,
    <CreditCard key="credit-card" className="w-6 h-6" />
  ];

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold mb-2">Create My Free RentCard</h1>
        <p className="text-gray-600 mb-4">
          This information can be updated at any time and submitted to potential landlords and property managers
        </p>
        <div className="w-full bg-gray-200 rounded-full h-4">
          <div
            className="bg-blue-600 h-4 rounded-full transition-all duration-500"
            style={{ width: `${progress}%` }}
          >
          </div>
          <p className="text-sm mt-2">{progress}% Complete</p>
        </div>
      </div>

      <div className="mb-8">
        <div className="flex justify-between items-center mb-8">
          {[1, 2, 3, 4].map((num) => (
            <div key={num} className="flex items-center">
              <div className={`rounded-full p-3 ${
                step >= num ? 'bg-blue-600 text-white' : 'bg-gray-200'
              }`}>
                {icons[num-1]}
              </div>
              {num < 4 && (
                <div className={`w-full h-1 ${
                  step > num ? 'bg-blue-600' : 'bg-gray-200'
                }`} />
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-lg p-6 shadow-lg">
        {step < 5 && (
          <h2 className="text-2xl font-bold mb-6">{sectionTitles[step]}</h2>
        )}
        {renderStep()}

        <div className="mt-8 flex justify-between">
          {step > 1 && (
            <button
              type="button"
              onClick={() => setStep(step - 1)}
              className="px-6 py-2 bg-gray-200 rounded-lg hover:bg-gray-300"
            >
              Back
            </button>
          )}
          <button
            type="button"
            onClick={() => {
              if (step < 4) {
                setStep(step + 1);
              } else if (step === 4) {
                setIsComplete(true);
                setStep(5);
              } else {
                console.log('Complete form', formData);
              }
            }}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 ml-auto flex items-center"
          >
            {step === 4 ? 'Create RentCard' : 'Next'}
            <ChevronRight className="w-4 h-4 ml-2" />
          </button>
        </div>
      </div>
    </div>
  );
}