
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
  ...passedProps
}) => {
  console.log(currentUserProfile)
  console.log(currentUser)

  const useInsert = useMemo(() => !currentUserProfile, [currentUserProfile])
  const initUserProfile = useMemo(() => currentUserProfile || {}, [currentUserProfile])
  const initUserName = useMemo(() => initUserProfile.userName || '', [initUserProfile.userName])
  const [formUserName, setFormUserName] = useState(initUserName)

  useEffect(() => {
    setFormUserName(initUserName)
    return () => setFormUserName('')
  }, [initUserName])

  const onSubmitForm = useCallback((event) => {
    if (useInsert) {
      handleInsertUserProfile({
        userName: formUserName
      })
    } else {
      handleSetUserProfile({
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

  if (!currentUser || !currentUser._id) {
    return null
  }

  return (
    <div
      className={classNames(className, styles.UserProfile)}
    >
      Profile
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
