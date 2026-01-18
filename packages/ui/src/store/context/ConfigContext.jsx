import platformsettingsApi from '@/api/platformsettings'
import PropTypes from 'prop-types'
import { createContext, useContext, useEffect, useState } from 'react'

const ConfigContext = createContext()

export const ConfigProvider = ({ children }) => {
    const [config, setConfig] = useState({})
    const [loading, setLoading] = useState(true)
    const [isIam, setIam] = useState(false)
    const [isCloud, setCloud] = useState(false)
    const [isOpenSource, setOpenSource] = useState(false)

    useEffect(() => {
        const userSettings = platformsettingsApi.getSettings()
        Promise.all([userSettings])
            .then(([currentSettingsData]) => {
                const finalData = {
                    ...currentSettingsData.data
                }
                setConfig(finalData)
                if (finalData.PLATFORM_TYPE) {
                    if (finalData.PLATFORM_TYPE === 'iam') {
                        setIam(true)
                        setCloud(false)
                        setOpenSource(false)
                    } else if (finalData.PLATFORM_TYPE === 'cloud') {
                        setCloud(true)
                        setIam(false)
                        setOpenSource(false)
                    } else {
                        setOpenSource(true)
                        setIam(false)
                        setCloud(false)
                    }
                }

                setLoading(false)
            })
            .catch((error) => {
                console.error('Error fetching data:', error)
                setLoading(false)
            })
    }, [])

    return (
        <ConfigContext.Provider value={{ config, loading, isIam, isCloud, isOpenSource }}>{children}</ConfigContext.Provider>
    )
}

export const useConfig = () => useContext(ConfigContext)

ConfigProvider.propTypes = {
    children: PropTypes.any
}
