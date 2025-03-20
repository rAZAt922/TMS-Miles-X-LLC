import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Container,
  Avatar,
  Chip,
  IconButton,
  TextField,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Menu,
  MenuItem,
  Modal,
  Select,
  InputLabel,
  FormControl,
  ListItemText,
  OutlinedInput,
  Checkbox,
} from '@mui/material';
import {
  Add as AddIcon,
  FilterList as FilterListIcon,
  InfoOutlined,
  MoreVert as MoreVertIcon,
  Delete as DeleteIcon,
  Close as CloseIcon,
} from '@mui/icons-material';
import { getFirestore, collection, getDocs, addDoc, deleteDoc, doc, getDoc } from 'firebase/firestore';
import { visuallyHidden } from '@mui/utils';

const modalStyle = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: 400,
  bgcolor: 'background.paper',
  border: '2px solid #000',
  boxShadow: 24,
  p: 4,
};

const ITEM_HEIGHT = 48;
const ITEM_PADDING_TOP = 8;
const MenuProps = {
  PaperProps: {
    style: {
      maxHeight: ITEM_HEIGHT * 4.5 + ITEM_PADDING_TOP,
      width: 200,
    },
  },
};

function Dispatchers() {
  const [dispatchers, setDispatchers] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [newDispatcher, setNewDispatcher] = useState({
    name: '',
    username: '',
    telegram: '',
    email: '',
    phone: '',
    teams: [],
  });
  const [selectedDispatcherId, setSelectedDispatcherId] = useState(null);
  const [deleteConfirmationOpen, setDeleteConfirmationOpen] = useState(false);
  const [menuAnchorEl, setMenuAnchorEl] = useState(null);
  const isMenuOpen = Boolean(menuAnchorEl);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [selectedDispatcher, setSelectedDispatcher] = useState(null);
  const [detailedDispatcher, setDetailedDispatcher] = useState(null);
  const [teams, setTeams] = useState(['Team A', 'Team B', 'Team C']); // Mock teams data
  const [selectedTeam, setSelectedTeam] = useState(null);

  useEffect(() => {
    fetchDispatchers();
  }, []);

  const fetchDispatchers = async () => {
    const db = getFirestore();
    const querySnapshot = await getDocs(collection(db, 'Dispatchers'));
    const dispatcherList = querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    setDispatchers(dispatcherList);
  };

  const addDispatcherToFirestore = async () => {
    const db = getFirestore();
    try {
      await addDoc(collection(db, "Dispatchers"), {
        ...newDispatcher,
        onDuty: false,
        loads: [],
        avatar: newDispatcher.name.substring(0, 2).toUpperCase(),
      });
      setNewDispatcher({
        name: '',
        username: '',
        telegram: '',
        email: '',
        phone: '',
        teams: [],
      });
      await fetchDispatchers();
      setShowForm(false);
    } catch (e) {
      console.error("Error adding document: ", e);
    }
  };

  const handleOpenDeleteConfirmation = (dispatcherId) => {
    setSelectedDispatcherId(dispatcherId);
    setDeleteConfirmationOpen(true);
  };

  const handleCloseDeleteConfirmation = () => {
    setDeleteConfirmationOpen(false);
  };

  const handleDeleteDispatcher = async () => {
    if (selectedDispatcherId) {
      const db = getFirestore();
      try {
        await deleteDoc(doc(db, "Dispatchers", selectedDispatcherId));
        console.log("Document successfully deleted!");
        await fetchDispatchers();
      } catch (error) {
        console.error("Error deleting document: ", error);
      }
      setDeleteConfirmationOpen(false);
      setSelectedDispatcherId(null);
    } else {
      console.log("No dispatcher selected for deletion.");
    }
  };

  const handleMenuOpen = (event, dispatcherId) => {
    setSelectedDispatcherId(dispatcherId);
    setMenuAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setMenuAnchorEl(null);
  };

  const fetchDispatcherDetails = async (dispatcherId) => {
    const db = getFirestore();
    const docRef = doc(db, "Dispatchers", dispatcherId);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      setDetailedDispatcher(docSnap.data());
    } else {
      console.log("No such document!");
      setDetailedDispatcher(null);
    }
  };

  const handleDispatcherClick = async (dispatcher) => {
    setSelectedDispatcher(dispatcher);
    await fetchDispatcherDetails(dispatcher.id);
    setIsDetailsModalOpen(true);
  };

  const handleDetailsModalClose = () => {
    setIsDetailsModalOpen(false);
    setSelectedDispatcher(null);
    setDetailedDispatcher(null);
  };

  const handleMenuButtonClick = (event, dispatcherId) => {
    event.stopPropagation();
    setSelectedDispatcherId(dispatcherId); // Ensure selectedDispatcherId is set correctly
    handleMenuOpen(event, dispatcherId);
  };

  const handleInputChange = (event) => {
    setNewDispatcher({ ...newDispatcher, [event.target.name]: event.target.value });
  };

  const handleTeamChange = (event) => {
    const { value } = event.target;
    setNewDispatcher({ ...newDispatcher, teams: value });
  };

  const handleTeamSelect = (team) => {
    setSelectedTeam(team);
  };

  const filteredDispatchers = selectedTeam
    ? dispatchers.filter((dispatcher) => dispatcher.teams && dispatcher.teams.includes(selectedTeam))
    : dispatchers;

  return (
    <Container maxWidth="xl">
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4">Dispatchers</Typography>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <Button variant="contained" startIcon={<AddIcon />} onClick={() => setShowForm(true)}>
            Add Dispatcher
          </Button>
        </Box>
      </Box>

      {/* Team Selection */}
      <Box sx={{ mb: 2 }}>
        <Typography variant="h6">View Team:</Typography>
        {teams.map((team) => (
          <Chip
            key={team}
            label={team}
            onClick={() => handleTeamSelect(team)}
            sx={{ mr: 1, cursor: 'pointer' }}
            color={selectedTeam === team ? 'primary' : 'default'}
          />
        ))}
        {selectedTeam && (
          <Button onClick={() => setSelectedTeam(null)} sx={{ ml: 2 }}>
            View All
          </Button>
        )}
      </Box>

      {/* Add Dispatcher Form */}
      <Dialog open={showForm} onClose={() => setShowForm(false)} fullWidth maxWidth="sm">
        <DialogTitle>Add New Dispatcher</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            id="name"
            label="Name"
            type="text"
            fullWidth
            variant="outlined"
            name="name"
            value={newDispatcher.name}
            onChange={handleInputChange}
          />
          <TextField
            margin="dense"
            id="username"
            label="Username"
            type="text"
            fullWidth
            variant="outlined"
            name="username"
            value={newDispatcher.username}
            onChange={handleInputChange}
          />
          <TextField
            margin="dense"
            id="telegram"
            label="Telegram"
            type="text"
            fullWidth
            variant="outlined"
            name="telegram"
            value={newDispatcher.telegram}
            onChange={handleInputChange}
          />
          <TextField
            margin="dense"
            id="email"
            label="Email"
            type="email"
            fullWidth
            variant="outlined"
            name="email"
            value={newDispatcher.email}
            onChange={handleInputChange}
          />
          <TextField
            margin="dense"
            id="phone"
            label="Phone"
            type="text"
            fullWidth
            variant="outlined"
            name="phone"
            value={newDispatcher.phone}
            onChange={handleInputChange}
          />
          <FormControl sx={{ m: 1, width: '100%' }}>
            <InputLabel id="multiple-teams-label">Teams</InputLabel>
            <Select
              labelId="multiple-teams-label"
              id="multiple-teams"
              multiple
              value={newDispatcher.teams}
              onChange={handleTeamChange}
              input={<OutlinedInput label="Teams" />}
              renderValue={(selected) => selected.join(', ')}
              MenuProps={MenuProps}
            >
              {teams.map((team) => (
                <MenuItem key={team} value={team}>
                  <Checkbox checked={newDispatcher.teams.indexOf(team) > -1} />
                  <ListItemText primary={team} />
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowForm(false)}>Cancel</Button>
          <Button onClick={addDispatcherToFirestore}>Add</Button>
        </DialogActions>
      </Dialog>

      <Paper sx={{ borderRadius: 2, overflow: 'hidden' }}>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Dispatcher</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Managed Loads</TableCell>
                <TableCell>Teams</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredDispatchers.map((dispatcher) => {
                const loads = dispatcher.loads || [];
                const teamsList = dispatcher.teams ? dispatcher.teams.join(', ') : 'No Team';

                return (
                  <TableRow
                    key={dispatcher.id}
                    sx={{ '&:last-child td, &:last-child th': { border: 0 }, cursor: 'pointer' }}
                    onClick={() => handleDispatcherClick(dispatcher)}
                  >
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Avatar sx={{ mr: 2 }}>{dispatcher.avatar}</Avatar>
                        <Box>
                          <Typography variant="body1" sx={{ fontWeight: 'medium' }}>{dispatcher.name}</Typography>
                          <Typography variant="caption" color="text.secondary">ID: DSP-{dispatcher.id.toString().padStart(4, '0')}</Typography>
                        </Box>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={dispatcher.onDuty ? "On Duty" : "Off Duty"}
                        size="small"
                        color={dispatcher.onDuty ? "success" : "default"}
                      />
                    </TableCell>
                    <TableCell>{loads.length}</TableCell>
                    <TableCell>{teamsList}</TableCell>
                    <TableCell>
                      <IconButton
                        aria-label="more"
                        aria-controls="dispatcher-menu"
                        aria-haspopup="true"
                        onClick={(event) => handleMenuButtonClick(event, dispatcher.id)}
                      >
                        <MoreVertIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      <Menu
        id="dispatcher-menu"
        anchorEl={menuAnchorEl}
        open={isMenuOpen}
        onClose={handleMenuClose}
        MenuListProps={{
          'aria-labelledby': 'basic-button',
        }}
      >
        <MenuItem onClick={() => { handleOpenDeleteConfirmation(selectedDispatcherId); handleMenuClose(); }}>
          <DeleteIcon sx={{ mr: 1 }} />
          Delete
        </MenuItem>
        <MenuItem onClick={() => { setSelectedDispatcher(dispatchers.find(d => d.id === selectedDispatcherId)); handleMenuClose(); setIsDetailsModalOpen(true); }}>
          <InfoOutlined sx={{ mr: 1 }} />
          View Details
        </MenuItem>
      </Menu>

      <Dialog
        open={deleteConfirmationOpen}
        onClose={handleCloseDeleteConfirmation}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">{"Delete Dispatcher?"}</DialogTitle>
        <DialogContent>
          <Typography>Are you sure you want to delete this dispatcher?</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDeleteConfirmation} color="primary">
            Cancel
          </Button>
          <Button onClick={handleDeleteDispatcher} color="primary" autoFocus>
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      <Modal
        open={isDetailsModalOpen}
        onClose={handleDetailsModalClose}
        aria-labelledby="dispatcher-details-modal-title"
        aria-describedby="dispatcher-details-modal-description"
      >
        <Box sx={modalStyle}>
          <Typography id="dispatcher-details-modal-title" variant="h6" component="h2">
            Dispatcher Details
          </Typography>
          <IconButton
            aria-label="close"
            onClick={handleDetailsModalClose}
            sx={{
              position: 'absolute',
              right: 8,
              top: 8,
              color: (theme) => theme.palette.grey[500],
            }}
          >
            <CloseIcon />
          </IconButton>
          {detailedDispatcher && (
            <Box>
              <Typography variant="body1">Name: {detailedDispatcher.name}</Typography>
              <Typography variant="body1">Username: {detailedDispatcher.username}</Typography>
              <Typography variant="body1">Telegram: {detailedDispatcher.telegram}</Typography>
              <Typography variant="body1">Email: {detailedDispatcher.email}</Typography>
              <Typography variant="body1">Phone: {detailedDispatcher.phone}</Typography>
              <Typography variant="body1">On Duty: {detailedDispatcher.onDuty ? 'Yes' : 'No'}</Typography>
              <Typography variant="body1">Managed Loads: {detailedDispatcher.loads ? detailedDispatcher.loads.length : 0}</Typography>
              <Typography variant="body1">Teams: {detailedDispatcher.teams ? detailedDispatcher.teams.join(', ') : 'No Team'}</Typography>
            </Box>
          )}
        </Box>
      </Modal>
    </Container>
  );
}

export default Dispatchers;