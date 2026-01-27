import { useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'

// material-ui
import { Stack, Typography, Box, useTheme, CircularProgress, Alert } from '@mui/material'

// project imports
import MainCard from '@/ui-component/cards/MainCard'
import accountApi from '@/api/account.api'
import useApi from '@/hooks/useApi'
import { IconX } from '@tabler/icons-react'

// ==============================|| Accept Invite ||============================== //

const AcceptInvite = () => {
    const [searchParams] = useSearchParams()
    const [loading, setLoading] = useState(false)
    const [errorMessage, setErrorMessage] = useState('')
    const navigate = useNavigate()
    const theme = useTheme()
    const acceptInviteApi = useApi(accountApi.acceptInvite)

    useEffect(() => {
        const token = searchParams.get('token')
        if (!token) {
            setErrorMessage('Invite token is missing.')
            return
        }
        acceptInviteApi.request({ token })
        setLoading(true)
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    useEffect(() => {
        if (acceptInviteApi.error) {
            const message = acceptInviteApi.error?.response?.data?.message || 'Unable to accept invite.'
            setErrorMessage(message)
            setLoading(false)
        }
    }, [acceptInviteApi.error])

    useEffect(() => {
        if (acceptInviteApi.data) {
            setLoading(false)
            const steps = acceptInviteApi.data?.nextSteps || []
            const localStep = steps.find((step) => step.type === 'local-auth' && step.token)
            if (localStep) {
                navigate(`/reset-password?token=${encodeURIComponent(localStep.token)}&mode=invite`)
            } else {
                navigate('/')
            }
        }
    }, [acceptInviteApi.data, navigate])

    return (
        <MainCard>
            <Stack flexDirection='column' sx={{ width: '480px', gap: 3 }}>
                <Stack sx={{ width: '100%', alignItems: 'center', justifyContent: 'center', gap: 4 }}>
                    <Stack sx={{ alignItems: 'center', gap: 2 }}>
                        {loading && (
                            <>
                                <CircularProgress
                                    sx={{
                                        width: '48px',
                                        height: '48px'
                                    }}
                                />
                                <Typography variant='h1'>Accepting your invite...</Typography>
                            </>
                        )}
                        {errorMessage && (
                            <>
                                <Box
                                    sx={{
                                        width: '48px',
                                        height: '48px',
                                        borderRadius: '100%',
                                        backgroundColor: theme.palette.error.main,
                                        color: 'white',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center'
                                    }}
                                >
                                    <IconX />
                                </Box>
                                <Typography variant='h1'>Invite Link Error.</Typography>
                                <Alert severity='error'>{errorMessage}</Alert>
                            </>
                        )}
                    </Stack>
                </Stack>
            </Stack>
        </MainCard>
    )
}

export default AcceptInvite
