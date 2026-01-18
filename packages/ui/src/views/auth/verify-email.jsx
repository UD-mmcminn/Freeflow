import { useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'

// material-ui
import { Stack, Typography, Box, useTheme, CircularProgress } from '@mui/material'

// project imports
import MainCard from '@/ui-component/cards/MainCard'

// API
// icons
import { useState } from 'react'
import { IconX } from '@tabler/icons-react'

const VerifyEmail = () => {
    const [searchParams] = useSearchParams()
    const [loading, setLoading] = useState(false)
    const [verificationError, setVerificationError] = useState('')
    const navigate = useNavigate()

    const theme = useTheme()

    useEffect(() => {
        const token = searchParams.get('token')
        if (token) {
            setLoading(true)
            setVerificationError('')
            navigate(`/reset-password?token=${encodeURIComponent(token)}&mode=invite`)
            return
        }
        setLoading(false)
        setVerificationError('Invite token is missing.')
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

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
                                <Typography variant='h1'>Redirecting to set your password...</Typography>
                            </>
                        )}
                        {verificationError && (
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
                            </>
                        )}
                    </Stack>
                </Stack>
            </Stack>
        </MainCard>
    )
}

export default VerifyEmail
