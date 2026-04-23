import React, { useEffect, useState } from 'react';
import {
  Box,
  Button,
  CircularProgress,
  Container,
  IconButton,
  MenuItem,
  Paper,
  Select,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  Card,
  CardContent,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
} from '@mui/material';
import Grid from '@mui/material/Grid';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as ChartTooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts';
import { Download, RefreshCw, Eye } from 'lucide-react';
import { useToast, ToastProvider } from '../context/ToastContext';
import ToastManager from '../context/ToastManager';
import api from '../services/api';
import type { Complaint, Stats } from '../types';

const getModerationDisplay = (complaint: Complaint) => {
  const moderation = complaint.moderation;

  if (!moderation) {
    return {
      label: 'Not Scored',
      color: 'default' as const,
    };
  }

  if (moderation.status === 'blocked') {
    return {
      label: 'Blocked',
      color: 'error' as const,
    };
  }

  if (moderation.status === 'flagged') {
    if (moderation.duplicateScore >= 70) {
      return {
        label: 'Possible Duplicate',
        color: 'warning' as const,
      };
    }

    if (moderation.abusiveScore >= 25) {
      return {
        label: 'Flagged Abuse',
        color: 'error' as const,
      };
    }

    return {
      label: 'Flagged Spam',
      color: 'warning' as const,
    };
  }

  return {
    label: 'Clean',
    color: 'success' as const,
  };
};

const AdminDashboard: React.FC = () => {
  const { addToast } = useToast();
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedComplaint, setSelectedComplaint] = useState<Complaint | null>(null);
  const [detailsLoading, setDetailsLoading] = useState(false);
  const [handlerDraft, setHandlerDraft] = useState('');

  const fetchData = async () => {
    setLoading(true);
    try {
      const [complaintsRes, statsRes] = await Promise.all([
        api.get('/complaints'),
        api.get('/stats/all'),
      ]);
      setComplaints(complaintsRes.data.data);
      setStats(statsRes.data.data);
      addToast('Data refreshed successfully!', 'success');
    } catch (err) {
      console.error('Failed to fetch admin data', err);
      addToast('Failed to fetch data. Please try again.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleStatusChange = async (id: string, newStatus: string) => {
    try {
      await api.patch(`/complaints/${id}/status`, { status: newStatus });
      fetchData();
      addToast(`Status updated to ${newStatus}.`, 'success');
    } catch (err) {
      console.error('Failed to update status', err);
      addToast('Failed to update status. Please try again.', 'error');
    }
  };

  const openDetails = async (id: string) => {
    setDetailsLoading(true);
    try {
      const response = await api.get(`/complaints/${id}`);
      setSelectedComplaint(response.data.data);
      setHandlerDraft(response.data.data.handledBy || '');
    } catch (err) {
      console.error('Failed to load complaint details', err);
      addToast('Failed to load details.', 'error');
    } finally {
      setDetailsLoading(false);
    }
  };

  const closeDetails = () => {
    setSelectedComplaint(null);
    setHandlerDraft('');
  };

  const saveHandler = async () => {
    if (!selectedComplaint) return;
    try {
      await api.patch(`/complaints/${selectedComplaint._id}/status`, { handledBy: handlerDraft });
      addToast('Handler updated successfully!', 'success');
      fetchData();
      setSelectedComplaint({
        ...selectedComplaint,
        handledBy: handlerDraft,
      });
    } catch (err) {
      console.error('Failed to update handler', err);
      addToast('Failed to update handler.', 'error');
    }
  };

  const handleExport = async () => {
    try {
      const response = await api.get('/export/csv', { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `complaints_${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      addToast('CSV export completed successfully!', 'success');
    } catch (err) {
      console.error('Export failed', err);
      addToast('Failed to export data. Please try again.', 'error');
    }
  };

  if (loading && !stats) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
        <CircularProgress sx={{ color: 'primary.main' }} />
      </Box>
    );
  }

  const chartData = stats?.categoryDistribution.labels.map((label, index) => (
    {
      name: label,
      value: stats.categoryDistribution.data[index],
    }
  )) || [];

  const COLORS = ['#2563eb', '#7c3aed', '#10b981', '#f59e0b', '#ef4444'];

  return (
    <Container maxWidth="lg" sx={{ py: 4, backgroundColor: 'background.paper', borderRadius: 2, boxShadow: '0 0 20px rgba(0,0,0,0.05)' }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4, p: 2, backgroundColor: 'background.paper', borderRadius: 2, boxShadow: '0 0 10px rgba(0,0,0,0.05)' }}>
        <Box sx={{ display: 'flex', flexDirection: 'column' }}>
          <Typography variant="h4" fontWeight={700} color="primary.main" gutterBottom>Admin Dashboard</Typography>
          <Typography variant="body2" color="text.secondary">Oversee and manage all system complaints</Typography>
        </Box>
        <Stack direction="row" spacing={2}>
          <Button startIcon={<RefreshCw size={18} />} variant="outlined" onClick={fetchData} sx={{ backgroundColor: 'primary.main', color: 'white' }}>
            Refresh Data
          </Button>
          <IconButton aria-label="export" onClick={handleExport} sx={{ mr: 1, bgcolor: 'primary.main', color: 'white' }}>
            <Download size={20} />
          </IconButton>
        </Stack>
      </Box>

      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 4, p: 2, backgroundColor: 'background.paper', borderRadius: 2, boxShadow: '0 0 10px rgba(0,0,0,0.05)' }}>
        <Grid size={{ xs: 12, sm: 4 }}>
          <Card sx={{ boxShadow: '0 3px 5px rgba(0,0,0,0.1)' }}>
            <CardContent sx={{ p: 2, textAlign: 'center' }}>
              <Typography variant="h6" fontWeight={700} color="primary.main" gutterBottom>Total Complaints</Typography>
              <Chip label={stats?.total ? `${stats.total}` : '0'} variant="outlined" color="success" sx={{ mt: 1 }} />
            </CardContent>
          </Card>
        </Grid>
        <Grid size={{ xs: 12, sm: 4 }}>
          <Card sx={{ boxShadow: '0 3px 5px rgba(0,0,0,0.1)' }}>
            <CardContent sx={{ p: 2, textAlign: 'center' }}>
              <Typography variant="h6" fontWeight={700} color="warning.main" gutterBottom>Pending Complaints</Typography>
              <Chip label={stats?.pending ? `${stats.pending}` : '0'} variant="outlined" color="warning" sx={{ mt: 1 }} />
            </CardContent>
          </Card>
        </Grid>
        <Grid size={{ xs: 12, sm: 4 }}>
          <Card sx={{ boxShadow: '0 3px 5px rgba(0,0,0,0.1)' }}>
            <CardContent sx={{ p: 2, textAlign: 'center' }}>
              <Typography variant="h6" fontWeight={700} color="success.main" gutterBottom>Resolved Complaints</Typography>
              <Chip label={stats?.resolved ? `${stats.resolved}` : '0'} variant="outlined" color="success" sx={{ mt: 1 }} />
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Grid container spacing={4} sx={{ p: 2, backgroundColor: 'background.paper', borderRadius: 2, boxShadow: '0 0 10px rgba(0,0,0,0.05)' }}>
        {/* Chart */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Paper sx={{ p: 3, height: '400px', backgroundColor: 'background.paper', borderRadius: 2, boxShadow: '0 3px 5px rgba(0,0,0,0.1)' }}>
            <Typography variant="h6" fontWeight={700} gutterBottom>Category Distribution</Typography>
            <ResponsiveContainer width="100%" height="90%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" />
                <YAxis allowDecimals={false} />
                <ChartTooltip />
                <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                  {chartData.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>

        {/* Recent Activity / Table */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Paper sx={{ p: 3, height: '400px', backgroundColor: 'background.paper', borderRadius: 2, boxShadow: '0 3px 5px rgba(0,0,0,0.1)' }}>
            <Typography variant="h6" fontWeight={700} gutterBottom>Recent Complaints</Typography>
            <TableContainer sx={{ flexGrow: 1, overflowY: 'auto' }}>
              <Table stickyHeader size="small" sx={{ tableLayout: 'fixed', width: '100%' }}>
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 600, textAlign: 'center' }}>ID</TableCell>
                    <TableCell sx={{ textAlign: 'center' }}>Category</TableCell>
                    <TableCell sx={{ textAlign: 'center' }}>Location</TableCell>
                    <TableCell sx={{ textAlign: 'center' }}>Priority</TableCell>
                    <TableCell sx={{ textAlign: 'center' }}>Status</TableCell>
                    <TableCell sx={{ textAlign: 'center' }}>AI Review</TableCell>
                    <TableCell sx={{ textAlign: 'center' }}>Handler</TableCell>
                    <TableCell sx={{ textAlign: 'center' }}>Anonymous</TableCell>
                    <TableCell sx={{ textAlign: 'center' }}>Details</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {complaints.map((complaint) => {
                    const moderationDisplay = getModerationDisplay(complaint);

                    return (
                    <TableRow key={complaint._id} sx={{ '&:hover': { backgroundColor: 'action.hover' } }}>
                      <TableCell sx={{ fontWeight: 600, textAlign: 'center' }}>{complaint.id}</TableCell>
                      <TableCell sx={{ textAlign: 'center' }}>{complaint.category}</TableCell>
                      <TableCell sx={{ textAlign: 'center' }}>{complaint.location || '—'}</TableCell>
                      <TableCell sx={{ textAlign: 'center' }}>
                        <Typography
                          variant="caption"
                          sx={{
                            color: complaint.priority === 'High' ? 'error.main' :
                              complaint.priority === 'Medium' ? 'warning.main' : 'text.secondary',
                            fontWeight: 600
                          }}
                        >
                          {complaint.priority}
                        </Typography>
                      </TableCell>
                      <TableCell sx={{ textAlign: 'center' }}>
                        <Select
                          size="small"
                          value={complaint.status}
                          onChange={(e) => handleStatusChange(complaint._id, e.target.value)}
                          sx={{
                            height: 28,
                            fontSize: '0.75rem',
                            '& .MuiSelect-select': { py: 0, borderRadius: '4px' }
                          }}
                        >
                          <MenuItem value="Pending" sx={{ color: 'primary.main' }}>Pending</MenuItem>
                          <MenuItem value="In Progress" sx={{ color: 'warning.main' }}>In Progress</MenuItem>
                          <MenuItem value="Resolved" sx={{ color: 'success.main' }}>Resolved</MenuItem>
                        </Select>
                      </TableCell>
                      <TableCell sx={{ textAlign: 'center' }}>
                        <Chip
                          size="small"
                          label={moderationDisplay.label}
                          color={moderationDisplay.color}
                          variant={moderationDisplay.color === 'default' ? 'outlined' : 'filled'}
                        />
                      </TableCell>
                      <TableCell sx={{ textAlign: 'center' }}>
                        <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                          {complaint.handledBy || 'Unassigned'}
                        </Typography>
                      </TableCell>
                      <TableCell sx={{ textAlign: 'center' }}>
                        <Chip
                          size="small"
                          label={complaint.isAnonymous ? 'Yes' : 'No'}
                          color={complaint.isAnonymous ? 'warning' : 'success'}
                          variant="outlined"
                        />
                      </TableCell>
                      <TableCell sx={{ textAlign: 'center' }}>
                        <IconButton size="small" onClick={() => openDetails(complaint._id)}>
                          <Eye size={16} />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </Grid>
      </Grid>

      <Dialog open={Boolean(selectedComplaint)} onClose={closeDetails} maxWidth="md" fullWidth>
        <DialogTitle>Complaint Details</DialogTitle>
        <DialogContent dividers>
          {detailsLoading || !selectedComplaint ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
              <CircularProgress size={28} />
            </Box>
          ) : (
            <Stack spacing={2}>
              <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                <Chip label={selectedComplaint.id} variant="outlined" />
                <Chip label={selectedComplaint.category} />
                <Chip label={selectedComplaint.priority} color="info" />
                <Chip label={selectedComplaint.status} color="success" />
                <Chip label={getModerationDisplay(selectedComplaint).label} color={getModerationDisplay(selectedComplaint).color} />
                <Chip label={selectedComplaint.isAnonymous ? 'Anonymous' : 'Identified'} color={selectedComplaint.isAnonymous ? 'warning' : 'success'} variant="outlined" />
              </Box>

              <Typography variant="subtitle2">AI Review</Typography>
              <Paper variant="outlined" sx={{ p: 2, backgroundColor: 'grey.50' }}>
                <Stack spacing={1.5}>
                  <Typography variant="body2">
                    Status: <strong>{getModerationDisplay(selectedComplaint).label}</strong>
                  </Typography>
                  <Typography variant="body2">
                    Spam Score: <strong>{selectedComplaint.moderation?.spamScore ?? 0}</strong>
                  </Typography>
                  <Typography variant="body2">
                    Abuse Score: <strong>{selectedComplaint.moderation?.abusiveScore ?? 0}</strong>
                  </Typography>
                  <Typography variant="body2">
                    Duplicate Score: <strong>{selectedComplaint.moderation?.duplicateScore ?? 0}</strong>
                  </Typography>
                  <Typography variant="body2">
                    Reasons: <strong>{selectedComplaint.moderation?.reasons?.length ? selectedComplaint.moderation.reasons.join(', ') : 'No issues detected'}</strong>
                  </Typography>
                </Stack>
              </Paper>

              <Typography variant="subtitle2">Location</Typography>
              <Typography>{selectedComplaint.location || '—'}</Typography>

              <Typography variant="subtitle2">Description</Typography>
              <Typography>{selectedComplaint.description}</Typography>

              <Typography variant="subtitle2">Reported By</Typography>
              <Typography>
                {selectedComplaint.isAnonymous ? 'Anonymous' : (selectedComplaint.reportedBy || 'User')}
              </Typography>

              <TextField
                label="Handled By"
                value={handlerDraft}
                onChange={(e) => setHandlerDraft(e.target.value)}
                placeholder="Enter staff/handler name"
                fullWidth
              />

              <Typography variant="subtitle2">Attachments</Typography>
              {selectedComplaint.attachments && selectedComplaint.attachments.length > 0 ? (
                <Box
                  sx={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))',
                    gap: 1.5,
                  }}
                >
                  {selectedComplaint.attachments.map((att, index) => (
                    <Box
                      key={`${att.name}-${index}`}
                      component="img"
                      src={att.data}
                      alt={att.name}
                      sx={{
                        width: '100%',
                        height: 120,
                        objectFit: 'cover',
                        borderRadius: 2,
                        border: '1px solid rgba(15, 23, 42, 0.12)',
                      }}
                    />
                  ))}
                </Box>
              ) : (
                <Typography color="text.secondary">No attachments</Typography>
              )}
            </Stack>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={closeDetails} variant="outlined">Close</Button>
          <Button onClick={saveHandler} variant="contained">Save Handler</Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default function AdminDashboardWrapper() {
  return (
    <ToastProvider>
      <AdminDashboard />
      <ToastManager />
    </ToastProvider>
  );
}
