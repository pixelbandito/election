
// Third-party imports
// React
import React, { useCallback, useEffect, useMemo, useState } from 'react'
// Everything else
import classNames from 'classnames'

// Local imports
// ../
import Button from '../Button'
import styles from './UserProfile.module.css'

const UserProfile = ({
  className,
  currentUser,
  currentUserProfile,
  handleInsertUserProfile,
  handleSetUserProfile,
  userProfilesReady,
  ...passedProps
}) => {
  console.log(currentUserProfile)
  console.log(currentUser)

  const useInsert = useMemo(() => !currentUserProfile, [currentUserProfile])
  const initUserProfile = useMemo(() => currentUserProfile || {}, [currentUserProfile])
  const initUserName = useMemo(() => initUserProfile.userName || '', [initUserProfile.userName])
  const [formUserName, setFormUserName] = useState(initUserName)

  const handleSafeSetUserProfile = async (userProfile) => {
    try {
      handleSetUserProfile({
        ...initUserProfile,
        userName: formUserName
      })
    } catch (e) {
      console.warn(e)
    }
  }

  const handleSafeInsertUserProfile = async (userProfile) => {
    try {
      handleInsertUserProfile({
        ...initUserProfile,
        userName: formUserName
      })
    } catch (e) {
      console.warn(e)
    }
  }

  useEffect(() => {
    setFormUserName(initUserName)
    return () => setFormUserName('')
  }, [initUserName])

  const onSubmitForm = useCallback((event) => {
    if (useInsert) {
      handleSafeInsertUserProfile({
        userName: formUserName
      })
    } else {
      handleSafeSetUserProfile({
        ...initUserProfile,
        userName: formUserName
      })
    }

    event.preventDefault()
    return false
  }, [
    formUserName,
    handleInsertUserProfile,
    handleSetUserProfile,
    initUserProfile,
    useInsert
  ])

  const onRevertForm = event => {
    setFormUserName(initUserName)
  }

  if (!currentUser || !currentUser._id || !userProfilesReady) {
    return null
  }

  return (
    <div
      className={classNames(className, styles.UserProfile)}
    >
      <h1>Profile</h1>
      {currentUser && (!currentUserProfile || !currentUserProfile.userName) && (
        <div class={styles.warning}>
          <h3>Please add a public user name!</h3>
          <p>
            It helps the community see that the polls aren't all created by robots.
            <span role='img' aria-label='smile'>😄</span>
          </p>
        </div>
      )}
      <form
        onSubmit={onSubmitForm}
      >
        <label htmlFor='userName'>User name (public)</label>
        <input
          id='userName'
          onChange={(event) => setFormUserName(event.target.value)}
          placeholder='Pat Smith'
          type='text'
          value={formUserName}
        />
        <Button type='submit'>Save</Button>
        <Button onClick={onRevertForm}>Revert</Button>
      </form>
    </div>
  )
}

export default UserProfile
