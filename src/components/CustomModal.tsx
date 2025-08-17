import { CloseOutlined } from '@ant-design/icons'
import { type Dispatch, type ReactNode, type SetStateAction } from 'react'

const CustomModal = ({children, show, setShow}:{children:ReactNode, show:boolean, setShow:Dispatch<SetStateAction<boolean>>}) => {
    return (
        <div className={`fixed ${show ? "!top-0 bottom-0" : "!top-[-100%]"} z-[9999] duration-300 left-0 right-0 backdrop-blur-[10px] bg-[#1A1A1A4D]`}>
            <div className={`bg-white shadow-md w-full  ${show ? "bottom-0":"bottom-[-100%]"} py-[20px] duration-300 px-[16px] rounded-t-[16px] absolute`}>
                <button onClick={() => setShow(false)} className='w-[48px] absolute right-[16px] top-[-70px] h-[48px] bg-white rounded-full flex items-center justify-center'>
                    <CloseOutlined className='text-[16px]' />
                </button>
                {children}
            </div>
        </div>
    )
}

export default CustomModal