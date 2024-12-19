import {useOrganization} from '@clerk/nextjs'
import {useEffect} from 'react'

const useRefetchOnSwitch = (refetch: () => void) => {
  const {organization} = useOrganization()

  useEffect(() => {
    // Only refetch when organization changes
    if (organization?.id) {
      void refetch()
    }
  }, [organization?.id])
}

export default useRefetchOnSwitch
