import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { z } from 'zod'
import { useSelector } from 'react-redux'

// material-ui
import { Alert, Box, Button, Chip, Divider, Icon, List, ListItemText, Stack, TextField, Typography } from '@mui/material'

// project imports
import { StyledButton } from '@/ui-component/button/StyledButton'
import { Input } from '@/ui-component/input/Input'
import { BackdropLoader } from '@/ui-component/loading/BackdropLoader'

// API
import accountApi from '@/api/account.api'
import organizationApi from '@/api/organization'
import loginMethodApi from '@/api/loginmethod'

// Hooks
import useApi from '@/hooks/useApi'

// utils
import useNotifier from '@/utils/useNotifier'

// Icons
import Auth0SSOLoginIcon from '@/assets/images/auth0.svg'
import GoogleSSOLoginIcon from '@/assets/images/google.svg'
import AzureSSOLoginIcon from '@/assets/images/microsoft-azure.svg'
import { useConfig } from '@/store/context/ConfigContext'
import { IconCircleCheck, IconExclamationCircle } from '@tabler/icons-react'

// ==============================|| Organization & Admin User Setup ||============================== //

// IMPORTANT: when updating this schema, update the schema on the server as well
// packages/server/src/iam/types/organization.requests.ts
const OrgSetupNewUserSchema = z.object({
    organizationName: z.string().min(1, 'Organization name is required'),
    username: z.string().min(1, 'Name is required'),
    email: z.string().min(1, 'Email is required').email('Invalid email address')
})

const OrgSetupExistingUserSchema = z.object({
    organizationName: z.string().min(1, 'Organization name is required')
})

const OrganizationSetupPage = () => {
    useNotifier()
    const { isIam, isOpenSource } = useConfig()
    const currentUser = useSelector((state) => state.auth.user)
    const isLoggedIn = Boolean(currentUser?.id)

    const organizationNameInput = {
        label: 'Organization Name',
        name: 'organizationName',
        type: 'text',
        placeholder: 'Acme Inc.'
    }

    const usernameInput = {
        label: 'Username',
        name: 'username',
        type: 'text',
        placeholder: 'John Doe'
    }

    const emailInput = {
        label: 'EMail',
        name: 'email',
        type: 'email',
        placeholder: 'user@company.com'
    }

    const [organizationName, setOrganizationName] = useState('')
    const [email, setEmail] = useState('')
    const [username, setUsername] = useState('')
    const [existingUsername, setExistingUsername] = useState('')
    const [existingPassword, setExistingPassword] = useState('')

    const [loading, setLoading] = useState(false)
    const [authError, setAuthError] = useState('')
    const [successMsg, setSuccessMsg] = useState(undefined)
    const [requiresAuthentication, setRequiresAuthentication] = useState(false)

    const setupOrganizationApi = useApi(organizationApi.setupOrganization)
    const getBasicAuthApi = useApi(accountApi.getBasicAuth)
    const navigate = useNavigate()

    const getDefaultProvidersApi = useApi(loginMethodApi.getLoginMethods)
    const [configuredSsoProviders, setConfiguredSsoProviders] = useState([])

    const register = async (event) => {
        event.preventDefault()
        const normalizedOrganizationName = organizationName.trim()
        const validationResult = (isLoggedIn ? OrgSetupExistingUserSchema : OrgSetupNewUserSchema).safeParse({
            organizationName: normalizedOrganizationName,
            username,
            email
        })
        if (!validationResult.success) {
            const errorMessages = validationResult.error.errors.map((error) => error.message)
            setAuthError(errorMessages.join(', '))
            return
        }

        setLoading(true)
        setAuthError('')

        // Check authentication first if required
        if (requiresAuthentication) {
            try {
                const authResult = await accountApi.checkBasicAuth({
                    username: existingUsername,
                    password: existingPassword
                })

                if (!authResult || !authResult.data || authResult.data.message !== 'Authentication successful') {
                    setAuthError('Authentication failed. Please check your existing credentials.')
                    setLoading(false)
                    return
                }
            } catch (error) {
                setAuthError('Authentication failed. Please check your existing credentials.')
                setLoading(false)
                return
            }
        }

        const body = {
            organization: {
                name: normalizedOrganizationName
            },
            user: isLoggedIn
                ? undefined
                : {
                      name: username,
                      email: email
                  }
        }

        await setupOrganizationApi.request(body)
    }

    useEffect(() => {
        if (setupOrganizationApi.error) {
            const response = setupOrganizationApi.error.response
            const errMessage = typeof response?.data === 'object' ? response?.data?.message : response?.data
            let finalErrMessage = ''
            if (response?.status === 409) {
                finalErrMessage = errMessage || 'Organization name already exists.'
            } else if (isIam) {
                finalErrMessage = `Error creating organization. ${errMessage || ''}`.trim()
            } else {
                finalErrMessage = `Error creating organization: ${errMessage || 'Unknown error'}`
            }
            setAuthError(finalErrMessage)
            setLoading(false)
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [setupOrganizationApi.error])

    useEffect(() => {
        if (getBasicAuthApi.data && getBasicAuthApi.data.isUsernamePasswordSet === true) {
            setRequiresAuthentication(true)
        }
    }, [getBasicAuthApi.data])

    useEffect(() => {
        if (!isOpenSource) {
            getDefaultProvidersApi.request()
        } else {
            getBasicAuthApi.request()
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    useEffect(() => {
        if (getDefaultProvidersApi.data && getDefaultProvidersApi.data.providers) {
            setConfiguredSsoProviders(getDefaultProvidersApi.data.providers.map((provider) => provider))
        }
    }, [getDefaultProvidersApi.data])

    useEffect(() => {
        if (setupOrganizationApi.data) {
            setLoading(false)
            setAuthError(undefined)
            setOrganizationName('')
            setUsername('')
            setEmail('')
            setSuccessMsg(
                isLoggedIn
                    ? 'Organization created successfully.'
                    : 'Invite sent. Please check your email to continue setup.'
            )
            setTimeout(() => {
                navigate(isLoggedIn ? '/' : '/signin')
            }, 3000)
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [setupOrganizationApi.data])

    const signInWithSSO = (ssoProvider) => {
        window.location.href = `/api/v1/${ssoProvider}/login`
    }

    return (
        <>
            <Box
                sx={{
                    width: '100%',
                    maxHeight: '100vh',
                    overflowY: 'auto',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    padding: '24px'
                }}
            >
                <Stack flexDirection='column' sx={{ width: '480px', gap: 3 }}>
                    {authError && (
                        <Alert icon={<IconExclamationCircle />} variant='filled' severity='error'>
                            {authError.split(', ').length > 0 ? (
                                <List dense sx={{ py: 0 }}>
                                    {authError.split(', ').map((error, index) => (
                                        <ListItemText key={index} primary={error} primaryTypographyProps={{ color: '#fff !important' }} />
                                    ))}
                                </List>
                            ) : (
                                authError
                            )}
                        </Alert>
                    )}
                    {successMsg && (
                        <Alert icon={<IconCircleCheck />} variant='filled' severity='success'>
                            {successMsg}
                        </Alert>
                    )}
                    <Stack sx={{ gap: 1 }}>
                        <Typography variant='h1'>Create Organization</Typography>
                    </Stack>
                    {requiresAuthentication && (
                        <Alert severity='info'>
                            Application authentication now requires email and password. Contact administrator to setup an account.
                        </Alert>
                    )}
                    {(isOpenSource || isIam) && (
                        <Typography variant='caption'>
                            Account setup does not make any external connections, your data stays securely on your locally hosted server.
                        </Typography>
                    )}
                    <form onSubmit={register}>
                        <Stack sx={{ width: '100%', flexDirection: 'column', alignItems: 'left', justifyContent: 'center', gap: 2 }}>
                            {requiresAuthentication && (
                                <>
                                    <Box>
                                        <div style={{ display: 'flex', flexDirection: 'row' }}>
                                            <Typography sx={{ mb: 1 }}>
                                                Existing Username<span style={{ color: 'red' }}>&nbsp;*</span>
                                            </Typography>
                                            <div style={{ flexGrow: 1 }}></div>
                                        </div>
                                        <TextField
                                            fullWidth
                                            placeholder='Existing Username'
                                            value={existingUsername}
                                            onChange={(e) => setExistingUsername(e.target.value)}
                                        />
                                        <Typography variant='caption'>
                                            <i>Existing username that was set as FLOWISE_USERNAME environment variable</i>
                                        </Typography>
                                    </Box>
                                    <Box>
                                        <div style={{ display: 'flex', flexDirection: 'row' }}>
                                            <Typography sx={{ mb: 1 }}>
                                                Existing Password<span style={{ color: 'red' }}>&nbsp;*</span>
                                            </Typography>
                                            <div style={{ flexGrow: 1 }}></div>
                                        </div>
                                        <TextField
                                            fullWidth
                                            type='password'
                                            placeholder='Existing Password'
                                            value={existingPassword}
                                            onChange={(e) => setExistingPassword(e.target.value)}
                                        />
                                        <Typography variant='caption'>
                                            <i>Existing password that was set as FLOWISE_PASSWORD environment variable</i>
                                        </Typography>
                                    </Box>
                                    <Divider>
                                        <Chip label='New Account Details' size='small' />
                                    </Divider>
                                </>
                            )}
                            <Box>
                                <div style={{ display: 'flex', flexDirection: 'row' }}>
                                    <Typography>
                                        Organization Name<span style={{ color: 'red' }}>&nbsp;*</span>
                                    </Typography>
                                    <div style={{ flexGrow: 1 }}></div>
                                </div>
                                <Input
                                    inputParam={organizationNameInput}
                                    placeholder='Organization Name'
                                    onChange={(newValue) => setOrganizationName(newValue)}
                                    value={organizationName}
                                    showDialog={false}
                                />
                                <Typography variant='caption'>
                                    <i>Must be unique and is used for display purposes only.</i>
                                </Typography>
                            </Box>
                            {!isLoggedIn && (
                                <>
                                    {isIam && (
                                        <Box>
                                            <Divider>
                                                <Chip label='Account Administrator' size='small' />
                                            </Divider>
                                        </Box>
                                    )}
                                    <Box>
                                        <div style={{ display: 'flex', flexDirection: 'row' }}>
                                            <Typography>
                                                Administrator Name<span style={{ color: 'red' }}>&nbsp;*</span>
                                            </Typography>
                                            <div style={{ flexGrow: 1 }}></div>
                                        </div>
                                        <Input
                                            inputParam={usernameInput}
                                            placeholder='Display Name'
                                            onChange={(newValue) => setUsername(newValue)}
                                            value={username}
                                            showDialog={false}
                                        />
                                        <Typography variant='caption'>
                                            <i>Is used for display purposes only.</i>
                                        </Typography>
                                    </Box>
                                    <Box>
                                        <div style={{ display: 'flex', flexDirection: 'row' }}>
                                            <Typography>
                                                Administrator Email<span style={{ color: 'red' }}>&nbsp;*</span>
                                            </Typography>
                                            <div style={{ flexGrow: 1 }}></div>
                                        </div>
                                        <Input
                                            inputParam={emailInput}
                                            onChange={(newValue) => setEmail(newValue)}
                                            type='email'
                                            value={email}
                                            showDialog={false}
                                        />
                                        <Typography variant='caption'>
                                            <i>We will send an invite link to this email to complete setup.</i>
                                        </Typography>
                                    </Box>
                                </>
                            )}
                            {isLoggedIn && currentUser?.email && (
                                <Typography variant='caption'>
                                    <i>Creating organization as {currentUser.email}.</i>
                                </Typography>
                            )}
                            <StyledButton
                                variant='contained'
                                style={{ borderRadius: 12, height: 40, marginRight: 5 }}
                                type='submit'
                                disabled={requiresAuthentication && (!existingUsername || !existingPassword)}
                            >
                                {isLoggedIn ? 'Create Organization' : 'Send Invite'}
                            </StyledButton>
                            {configuredSsoProviders && configuredSsoProviders.length > 0 && <Divider sx={{ width: '100%' }}>OR</Divider>}
                            {configuredSsoProviders &&
                                configuredSsoProviders.map(
                                    (ssoProvider) =>
                                        //https://learn.microsoft.com/en-us/entra/identity-platform/howto-add-branding-in-apps
                                        ssoProvider === 'azure' && (
                                            <Button
                                                key={ssoProvider}
                                                variant='outlined'
                                                style={{ borderRadius: 12, height: 45, marginRight: 5, lineHeight: 0 }}
                                                onClick={() => signInWithSSO(ssoProvider)}
                                                startIcon={
                                                    <Icon>
                                                        <img src={AzureSSOLoginIcon} alt={'MicrosoftSSO'} width={20} height={20} />
                                                    </Icon>
                                                }
                                            >
                                                Continue With Microsoft
                                            </Button>
                                        )
                                )}
                            {configuredSsoProviders &&
                                configuredSsoProviders.map(
                                    (ssoProvider) =>
                                        ssoProvider === 'google' && (
                                            <Button
                                                key={ssoProvider}
                                                variant='outlined'
                                                style={{ borderRadius: 12, height: 45, marginRight: 5, lineHeight: 0 }}
                                                onClick={() => signInWithSSO(ssoProvider)}
                                                startIcon={
                                                    <Icon>
                                                        <img src={GoogleSSOLoginIcon} alt={'GoogleSSO'} width={20} height={20} />
                                                    </Icon>
                                                }
                                            >
                                                Continue With Google
                                            </Button>
                                        )
                                )}
                            {configuredSsoProviders &&
                                configuredSsoProviders.map(
                                    (ssoProvider) =>
                                        ssoProvider === 'auth0' && (
                                            <Button
                                                key={ssoProvider}
                                                variant='outlined'
                                                style={{ borderRadius: 12, height: 45, marginRight: 5, lineHeight: 0 }}
                                                onClick={() => signInWithSSO(ssoProvider)}
                                                startIcon={
                                                    <Icon>
                                                        <img src={Auth0SSOLoginIcon} alt={'Auth0SSO'} width={20} height={20} />
                                                    </Icon>
                                                }
                                            >
                                                Continue With Auth0 by Okta
                                            </Button>
                                        )
                                )}
                        </Stack>
                    </form>
                </Stack>
            </Box>
            {loading && <BackdropLoader open={loading} />}
        </>
    )
}

export default OrganizationSetupPage
