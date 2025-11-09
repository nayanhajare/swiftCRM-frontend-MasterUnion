import { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useParams, useNavigate } from 'react-router-dom'
import { fetchLead, updateLead } from '../store/slices/leadSlice'
import { fetchActivities, createActivity } from '../store/slices/activitySlice'
import { getSocket } from '../utils/socket'
import { toast } from 'react-toastify'
import { format } from 'date-fns'

const LeadDetail = () => {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const { id } = useParams()
  const { currentLead } = useSelector((state) => state.leads)
  const { activities } = useSelector((state) => state.activities)
  const { user } = useSelector((state) => state.auth)

  const [isEditing, setIsEditing] = useState(false)
  const [formData, setFormData] = useState({})
  const [activityForm, setActivityForm] = useState({
    type: 'Note',
    title: '',
    description: '',
  })

  useEffect(() => {
    dispatch(fetchLead(id))
    dispatch(fetchActivities({ leadId: id }))
  }, [dispatch, id])

  useEffect(() => {
    if (currentLead) {
      setFormData({
        name: currentLead.name || '',
        email: currentLead.email || '',
        phone: currentLead.phone || '',
        company: currentLead.company || '',
        status: currentLead.status || 'New',
        source: currentLead.source || '',
        estimatedValue: currentLead.estimatedValue || '',
        assignedToId: currentLead.assignedToId || '',
        notes: currentLead.notes || '',
      })
    }
  }, [currentLead])

  useEffect(() => {
    const socket = getSocket()
    if (socket) {
      socket.emit('lead:subscribe', id)

      socket.on('lead:updated', (data) => {
        if (data.lead.id === parseInt(id)) {
          dispatch(fetchLead(id))
        }
      })

      socket.on('activity:created', (data) => {
        if (data.activity.leadId === parseInt(id)) {
          dispatch(fetchActivities({ leadId: id }))
        }
      })

      return () => {
        socket.emit('lead:unsubscribe', id)
        socket.off('lead:updated')
        socket.off('activity:created')
      }
    }
  }, [id, dispatch])

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
  }

  const handleSave = async () => {
    try {
      const submitData = {
        ...formData,
        estimatedValue: formData.estimatedValue ? parseFloat(formData.estimatedValue) : 0,
        assignedToId: formData.assignedToId || null,
      }
      await dispatch(updateLead({ id, data: submitData })).unwrap()
      toast.success('Lead updated successfully')
      setIsEditing(false)
    } catch (error) {
      toast.error(error || 'Failed to update lead')
    }
  }

  const handleActivitySubmit = async (e) => {
    e.preventDefault()
    try {
      await dispatch(createActivity({
        ...activityForm,
        leadId: parseInt(id),
      })).unwrap()
      toast.success('Activity added successfully')
      setActivityForm({ type: 'Note', title: '', description: '' })
    } catch (error) {
      toast.error(error || 'Failed to create activity')
    }
  }

  if (!currentLead) {
    return (
      <div className="text-center py-12">
        <div className="text-gray-500">Loading lead...</div>
      </div>
    )
  }

  const getStatusColor = (status) => {
    const colors = {
      New: 'bg-blue-100 text-blue-800',
      Contacted: 'bg-yellow-100 text-yellow-800',
      Qualified: 'bg-green-100 text-green-800',
      Proposal: 'bg-purple-100 text-purple-800',
      Negotiation: 'bg-orange-100 text-orange-800',
      Won: 'bg-green-100 text-green-800',
      Lost: 'bg-red-100 text-red-800',
    }
    return colors[status] || 'bg-gray-100 text-gray-800'
  }

  const getActivityIcon = (type) => {
    const icons = {
      Note: '📝',
      Call: '📞',
      Meeting: '🤝',
      Email: '📧',
      'Status Change': '🔄',
    }
    return icons[type] || '📋'
  }

  return (
    <div className="px-4 py-6 sm:px-0">
      <button
        onClick={() => navigate('/leads')}
        className="text-blue-600 hover:text-blue-800 mb-4"
      >
        ← Back to Leads
      </button>

      <div className="bg-white shadow rounded-lg p-6 mb-6">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{currentLead.name}</h1>
            <p className="text-gray-500 mt-1">{currentLead.email}</p>
          </div>
          <div className="flex space-x-2">
            {!isEditing ? (
              <button
                onClick={() => setIsEditing(true)}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium"
              >
                Edit
              </button>
            ) : (
              <>
                <button
                  onClick={handleSave}
                  className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md text-sm font-medium"
                >
                  Save
                </button>
                <button
                  onClick={() => {
                    setIsEditing(false)
                    setFormData({
                      name: currentLead.name || '',
                      email: currentLead.email || '',
                      phone: currentLead.phone || '',
                      company: currentLead.company || '',
                      status: currentLead.status || 'New',
                      source: currentLead.source || '',
                      estimatedValue: currentLead.estimatedValue || '',
                      assignedToId: currentLead.assignedToId || '',
                      notes: currentLead.notes || '',
                    })
                  }}
                  className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-md text-sm font-medium"
                >
                  Cancel
                </button>
              </>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
            {isEditing ? (
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              />
            ) : (
              <p className="text-gray-900">{currentLead.name}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            {isEditing ? (
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              />
            ) : (
              <p className="text-gray-900">{currentLead.email}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
            {isEditing ? (
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              />
            ) : (
              <p className="text-gray-900">{currentLead.phone || '-'}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Company</label>
            {isEditing ? (
              <input
                type="text"
                name="company"
                value={formData.company}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              />
            ) : (
              <p className="text-gray-900">{currentLead.company || '-'}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
            {isEditing ? (
              <select
                name="status"
                value={formData.status}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              >
                <option value="New">New</option>
                <option value="Contacted">Contacted</option>
                <option value="Qualified">Qualified</option>
                <option value="Proposal">Proposal</option>
                <option value="Negotiation">Negotiation</option>
                <option value="Won">Won</option>
                <option value="Lost">Lost</option>
              </select>
            ) : (
              <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(currentLead.status)}`}>
                {currentLead.status}
              </span>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Estimated Value</label>
            {isEditing ? (
              <input
                type="number"
                name="estimatedValue"
                step="0.01"
                value={formData.estimatedValue}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              />
            ) : (
              <p className="text-gray-900">${currentLead.estimatedValue || 0}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Assigned To</label>
            <p className="text-gray-900">{currentLead.assignedTo?.name || 'Unassigned'}</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Created By</label>
            <p className="text-gray-900">{currentLead.createdBy?.name || '-'}</p>
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
            {isEditing ? (
              <textarea
                name="notes"
                rows="3"
                value={formData.notes}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              />
            ) : (
              <p className="text-gray-900">{currentLead.notes || '-'}</p>
            )}
          </div>
        </div>
      </div>

      {/* Activity Timeline */}
      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Activity Timeline</h2>

        {/* Add Activity Form */}
        <div className="mb-6 p-4 bg-gray-50 rounded-lg">
          <form onSubmit={handleActivitySubmit}>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                <select
                  value={activityForm.type}
                  onChange={(e) => setActivityForm({ ...activityForm, type: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                >
                  <option value="Note">Note</option>
                  <option value="Call">Call</option>
                  <option value="Meeting">Meeting</option>
                  <option value="Email">Email</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                <input
                  type="text"
                  value={activityForm.title}
                  onChange={(e) => setActivityForm({ ...activityForm, title: e.target.value })}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  placeholder="Activity title"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <input
                  type="text"
                  value={activityForm.description}
                  onChange={(e) => setActivityForm({ ...activityForm, description: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  placeholder="Activity description"
                />
              </div>
            </div>
            <button
              type="submit"
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium"
            >
              Add Activity
            </button>
          </form>
        </div>

        {/* Activities List */}
        <div className="space-y-4">
          {activities.length === 0 ? (
            <p className="text-gray-500 text-center py-8">No activities yet</p>
          ) : (
            activities.map((activity) => (
              <div key={activity.id} className="flex items-start space-x-4 p-4 border-l-4 border-blue-500 bg-gray-50 rounded">
                <div className="text-2xl">{getActivityIcon(activity.type)}</div>
                <div className="flex-1">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">{activity.title}</h3>
                      <p className="text-sm text-gray-600">{activity.description}</p>
                    </div>
                    <div className="text-sm text-gray-500">
                      {format(new Date(activity.createdAt), 'MMM dd, yyyy HH:mm')}
                    </div>
                  </div>
                  <div className="mt-2 text-sm text-gray-500">
                    by {activity.user?.name} • {activity.type}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}

export default LeadDetail

