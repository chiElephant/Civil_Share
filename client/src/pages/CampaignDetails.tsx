import React, { useState, useEffect, useMemo, Suspense } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

import { useContractContext } from '../context/ContractContext';
const Loader = React.lazy(() => import('../components/Loader'));
const SuccessMessage = React.lazy(() => import('../components/SuccessMessage'));
const CustomButton = React.lazy(() => import('../components/CustomButton'));
import { CountBox, EthereumPrice } from '../components';
import { calculateBarPercentage, daysLeft } from '../utils';
import { ToastContainer, toast } from 'react-toastify';

const CampaignDetails = () => {
  const { state } = useLocation();
  const navigate = useNavigate();
  const { getDonations, getUserCampaigns, donate, contract, account } =
    useContractContext();

  const [isLoading, setIsLoading] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [amount, setAmount] = useState('');

  const [donators, setDonators] = useState<Donation[]>([]);
  const [creatorCampaigns, setCreatorCampaigns] = useState<Campaign[]>([]);
  const remainingDays = useMemo(
    () => daysLeft(state.deadline),
    [state.deadline]
  );
  const percentToTarget = useMemo(
    () => calculateBarPercentage(state.target, state.amountCollected),
    [state.target, state.amountCollected]
  );

  useEffect(() => {
    const fetchDonators = async () => {
      try {
        const data = await getDonations(state.pId);
        setDonators(data);
      } catch (err) {
        toast(`Error fetching donators: ${err}`);
        <ToastContainer />;
      }
    };

    const fetchCreatorCampaigns = async () => {
      try {
        const data = await getUserCampaigns(state.owner);
        setCreatorCampaigns(data);
      } catch (err) {
        toast(`Error fetching creator campaigns: ${err}`);
        <ToastContainer />;
      }
    };

    if (contract) {
      fetchDonators();
      fetchCreatorCampaigns();
    }
  }, [
    contract,
    account,
    getDonations,
    getUserCampaigns,
    state.owner,
    state.pId,
  ]);

  useEffect(() => {
    if (percentToTarget >= 100) setShowSuccessModal(true);
  }, [percentToTarget]);

  const handleDonate = async () => {
    setIsLoading(true);

    await donate(state.pId, amount);

    setIsLoading(false);
    setAmount('');
    navigate('/');
  };

  return (
    <div>
      {isLoading && (
        <Suspense fallback={null}>
          <Loader />
        </Suspense>
      )}
      {showSuccessModal && (
        <Suspense fallback={null}>
          <SuccessMessage
            percentToTarget={percentToTarget}
            showModal={setShowSuccessModal}
          />
        </Suspense>
      )}
      <div className='w-full flex md:flex-row flex-col mt-10 gap-[30px]'>
        <div className='flex-1 flex-col'>
          <img
            src={state.image}
            alt={'campaign'}
            loading='lazy'
            className='w-full h-[410px] object-contain rounded-xl'
          />
          <div className='relative w-full h-[5px] bg-black-2 mt-2'>
            <div
              className='absolute h-full bg-purple-main'
              style={{
                width: `${percentToTarget}%`,
                maxWidth: '100%',
              }}
            ></div>
          </div>
        </div>

        <div className='flex md:w-[150px] w-full flex-wrap justify-between gap-[30px]'>
          <CountBox
            title='Days Left'
            value={remainingDays}
          />
          <CountBox
            title={`Raised of ${state.target} ETH`}
            value={state.amountCollected}
          />
          <CountBox
            title='Total Backers'
            value={donators.length}
          />
        </div>
      </div>

      <div className='mt-[60px] flex lg:flex-row flex-col gap-5'>
        <div className='flex-2 flex flex-col gap-[40px]'>
          <div>
            <h4 className='font-epilogue font-semibold text-[18px] text-white uppercase'>
              Creator
            </h4>
            <div className='mt-[20px] flex flex-row items-center flex-wrap gap-[14px]'>
              <div className='w-[52px] h-[52px] flex items-center justify-center rounded-full bg-grey-1 cursor-pointer'>
                <img
                  src={'/logo.svg'}
                  alt='user'
                  loading='lazy'
                  className='w-[60%] h-[60%] object-cover'
                />
              </div>
              <div className=''>
                <h4 className='font-epilogue font-semibold text-[14px] text-white break-all'>
                  {state.owner}
                </h4>
                <p className='mt-[4px] font-epilogue font-normal text-[12px] text-primary-text'>
                  {creatorCampaigns.length}
                  {creatorCampaigns.length === 1 ? ' Campaign' : ' Campaigns'}
                </p>
              </div>
            </div>
          </div>

          <div>
            <h4 className='font-epilogue font-semibold text-[18px] text-white uppercase'>
              Story
            </h4>
            <div className='mt-[20px]'>
              <p className='font-epilogue font-normal text-[16px] text-primary-text leading-tight text-justify'>
                {state.description}
              </p>
            </div>
          </div>

          <div>
            <h4 className='font-epilogue font-semibold text-[18px] text-white uppercase'>
              Donators
            </h4>
            <div className='mt-[20px] flex flex-col gap-4'>
              {donators.length > 0 ?
                donators.map((item, index) => (
                  <div
                    key={`${item.donator}-${index}`}
                    className='flex justify-between items-center gap-4'
                  >
                    <p className='font-epilogue font-normal w-[70%] text-[16px] text-tertiary-text leading-[26px] break-all'>
                      {index + 1}. {item.donator}
                    </p>
                    <p className='w-fit font-epilogue font-normal text-[16px] text-primary-text leading-[26px]'>
                      {`${item.donation} ETH`}
                    </p>
                  </div>
                ))
              : <p className='font-epilogue font-normal text-[16px] text-primary-text leading-[16px] text-justify'>
                  No Donators yet. Be the first one!
                </p>
              }
            </div>
          </div>
        </div>

        <div className='flex-1'>
          <h4 className='font-epilogue font-semibold text-[18px] text-white uppercase'>
            Fund
          </h4>
          <div className='mt-[20px] flex flex-col p-4 bg-black-1 rounded-[10px]'>
            <p className='font-epilogue font-medium text-[20px] leading-[30px] text-center text-primary-text'>
              Fund the campaign
            </p>
            <div className='mt-[30px]'>
              <input
                type='number'
                placeholder='ETH 0.01'
                step='0.01'
                min='0.01'
                className='w-full py-[10px] sm:px-[20px] px-[15px] outline-hidden border-[1px] border-black-2 bg-transparent font-epilogue text-white text-[18px] leading-[30px] placeholder:text-placeholder-text rounded-[10px]'
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
              />
              <EthereumPrice
                target={amount}
                isDonation
              />
              <div className='my-[20px] p-4 bg-black-bg rounded-[10px]'>
                <h4 className='font-epilogue font-semibold text-[14px] leading-[22px] text-white'>
                  Fuel the vision because you believe in it!
                </h4>
                <p className='mt-[20px] font-epilogue font-normal leading-[22px] text-primary-text'>
                  Your support makes an impact—no reward needed, just the
                  satisfaction of knowing you helped bring this vision to life.
                </p>
              </div>
              <Suspense fallback={null}>
                <CustomButton
                  btnType='button'
                  title='Fund Campaign'
                  styles='w-full bg-light-purple'
                  handleClick={handleDonate}
                />
              </Suspense>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CampaignDetails;
