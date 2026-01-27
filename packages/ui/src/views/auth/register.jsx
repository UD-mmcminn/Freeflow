import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

import { BackdropLoader } from '@/ui-component/loading/BackdropLoader'
import { useConfig } from '@/store/context/ConfigContext'

// ==============================|| Register Redirect ||============================== //

const RegisterPage = () => {
    const navigate = useNavigate()
    const { isIam, isCloud } = useConfig()

    useEffect(() => {
        if (isIam || isCloud) {
            navigate('/organization-setup', { replace: true })
        } else {
            navigate('/signin', { replace: true })
        }
    }, [isIam, isCloud, navigate])

    return <BackdropLoader open />
}

export default RegisterPage
