import { useState, useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { fetchLeads, deleteLead, updateLeadInList } from '../store/slices/leadSlice'
import { getUsers } from '../store/slices/authSlice'
import { getSocket } from '../utils/socket'
import { toast } from 'react-toastify'
import { motion, AnimatePresence } from 'framer-motion'
import LeadModal from '../components/LeadModal'

const Leads = () => {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const { leads, pagination, isLoading } = useSelector((state) => state.leads)
  const { users } = useSelector((state) => state.auth)
  const { user } = useSelector((state) => state.auth)

  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingLead, setEditingLead] = useState(null)
  const [filters, setFilters] = useState({
    page: 1,
    limit: 10,
    status: '',
    search: '',
  })

  useEffect(() => {
    dispatch(fetchLeads(filters))
    if (user?.role === 'Admin' || user?.role === 'Manager') {
      dispatch(getUsers())
    }
  }, [dispatch, filters, user])

  // Socket listeners for real-time updates
  useEffect(() => {
    const socket = getSocket()
    if (socket) {
      socket.on('lead:created', () => {
        dispatch(fetchLeads(filters))
      })

      socket.on('lead:updated', (data) => {
        dispatch(updateLeadInList(data.lead))
      })

      socket.on('lead:deleted', () => {
        dispatch(fetchLeads(filters))
      })

      return () => {
        socket.off('lead:created')
        socket.off('lead:updated')
        socket.off('lead:deleted')
      }
    }
  }, [dispatch, filters])

  const handleSearch = (e) => {
    setFilters({ ...filters, search: e.target.value, page: 1 })
  }

  const handleStatusFilter = (e) => {
    setFilters({ ...filters, status: e.target.value, page: 1 })
  }

  const handleCreate = () => {
    setEditingLead(null)
    setIsModalOpen(true)
  }

  const handleEdit = (lead) => {
    setEditingLead(lead)
    setIsModalOpen(true)
  }

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this lead?')) {
      try {
        await dispatch(deleteLead(id)).unwrap()
        toast.success('Lead deleted successfully')
        dispatch(fetchLeads(filters))
      } catch (error) {
        toast.error(error)
      }
    }
  }

  const handleCloseModal = () => {
    setIsModalOpen(false)
    setEditingLead(null)
    dispatch(fetchLeads(filters))
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

  return (
    <div className="px-4 py-6 sm:px-0">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex justify-between items-center mb-6"
      >
        <h1 className="text-4xl font-bold text-white drop-shadow-lg">Leads</h1>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleCreate}
          className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-6 py-3 rounded-lg text-sm font-medium shadow-lg hover:shadow-xl transition-all duration-200 flex items-center space-x-2"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          <span>Add Lead</span>
        </motion.button>
      </motion.div>

      {/* Filters */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="glass-dark p-6 rounded-xl shadow-2xl mb-6 bg-white"
      >
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Search
            </label>
            <div className="relative">
              <input
                type="text"
                placeholder="Search leads..."
                value={filters.search}
                onChange={handleSearch}
                className="w-full px-4 py-2 pl-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
              />
              <svg className="absolute left-3 top-2.5 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Status
            </label>
            <select
              value={filters.status}
              onChange={handleStatusFilter}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white"
            >
              <option value="">All Statuses</option>
              <option value="New">New</option>
              <option value="Contacted">Contacted</option>
              <option value="Qualified">Qualified</option>
              <option value="Proposal">Proposal</option>
              <option value="Negotiation">Negotiation</option>
              <option value="Won">Won</option>
              <option value="Lost">Lost</option>
            </select>
          </div>
        </div>
      </motion.div>

      {/* Leads Table */}
      {isLoading ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-12"
        >
          <div className="spinner mx-auto mb-4"></div>
          <p className="text-gray-500">Loading leads...</p>
        </motion.div>
      ) : leads.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center py-12"
        >
          <div className="text-gray-500 text-lg">No leads found</div>
          <p className="text-gray-400 mt-2">Create your first lead to get started</p>
        </motion.div>
      ) : (
        <>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="glass-dark shadow-2xl overflow-hidden rounded-xl bg-white"
          >
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gradient-to-r from-blue-600 to-purple-600">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-white uppercase tracking-wider">
                      Name
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-white uppercase tracking-wider">
                      Email
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-white uppercase tracking-wider">
                      Company
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-white uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-white uppercase tracking-wider">
                      Assigned To
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-white uppercase tracking-wider">
                      Value
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-white uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  <AnimatePresence>
                    {leads.map((lead, index) => (
                      <motion.tr
                        key={lead.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 20 }}
                        transition={{ delay: index * 0.05 }}
                        className="hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 transition-all duration-200"
                      >
                        <td className="px-6 py-4 whitespace-nowrap">
                          <motion.div
                            whileHover={{ scale: 1.05 }}
                            className="text-sm font-semibold text-blue-600 cursor-pointer hover:text-blue-800 transition-colors duration-200"
                            onClick={() => navigate(`/leads/${lead.id}`)}
                          >
                            {lead.name}
                          </motion.div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                          {lead.email}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                          {lead.company || '-'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <motion.span
                            whileHover={{ scale: 1.1 }}
                            className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full shadow-sm ${getStatusColor(
                              lead.status
                            )}`}
                          >
                            {lead.status}
                          </motion.span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                          {lead.assignedTo?.name || '-'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-green-600">
                          ${lead.estimatedValue || 0}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex items-center space-x-2">
                            <motion.button
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                              onClick={() => handleEdit(lead)}
                              className="text-blue-600 hover:text-blue-800 transition-colors duration-200"
                            >
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                              </svg>
                            </motion.button>
                            {(user?.role === 'Admin' || user?.role === 'Manager') && (
                              <motion.button
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.9 }}
                                onClick={() => handleDelete(lead.id)}
                                className="text-red-600 hover:text-red-800 transition-colors duration-200"
                              >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                </svg>
                              </motion.button>
                            )}
                          </div>
                        </td>
                      </motion.tr>
                    ))}
                  </AnimatePresence>
                </tbody>
              </table>
            </div>
          </motion.div>

          {/* Pagination */}
          {pagination.pages > 1 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="mt-6 flex justify-between items-center glass-dark p-4 rounded-xl shadow-2xl bg-white"
            >
              <div className="text-sm font-medium text-gray-700">
                Showing {((pagination.page - 1) * pagination.limit) + 1} to{' '}
                {Math.min(pagination.page * pagination.limit, pagination.total)} of{' '}
                {pagination.total} results
              </div>
              <div className="flex space-x-2">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setFilters({ ...filters, page: pagination.page - 1 })}
                  disabled={pagination.page === 1}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-sm hover:shadow-md"
                >
                  Previous
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setFilters({ ...filters, page: pagination.page + 1 })}
                  disabled={pagination.page >= pagination.pages}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-sm hover:shadow-md"
                >
                  Next
                </motion.button>
              </div>
            </motion.div>
          )}
        </>
      )}

      {isModalOpen && (
        <LeadModal
          lead={editingLead}
          users={users}
          onClose={handleCloseModal}
        />
      )}
    </div>
  )
}

export default Leads

