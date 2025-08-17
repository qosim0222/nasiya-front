import { useNavigate } from 'react-router-dom'
import { SuccessImg } from '../assets/images'
import Heading from './Heading'
import Text from './Text'
import { Button } from 'antd'

const SuccessModal = ({ customerId }: { customerId?: string }) => {
  const navigate = useNavigate()
  const goBack = () => {
    if (customerId) {
      navigate(`/debtor/${customerId}`, { state: { refetch: true }, replace: true })
    } else {
      navigate(-1)
    }
  }
  return (
    <div className='fixed z-[9999] top-0 bottom-0 left-0 right-0 bg-white h-[100vh] flex items-center justify-center'>
      <div className='text-center'>
        <img className='mb-[27px]' src={SuccessImg} alt="Success img" width={200} height={131} />
        <Heading classList='!text-[#3478F7] !mb-[12px] !text-[22px]' tag='h1'>Ajoyib!</Heading>
        <Text classList='!font-medium !text-[16px]'>Muvaffaqiyatli so‘ndirildi</Text>
      </div>
      <div className='px-[16px] w-full !max-w-[400px] !absolute !bottom-[16px]'>
        <Button onClick={goBack} className="!h-[42px] !font-medium !text-[14px] !w-full" size="large" type="primary">
          Ortga
        </Button>
      </div>
    </div>
  )
}

export default SuccessModal
