import React, { useState, useEffect, useMemo, useCallback } from 'react';
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
  CircularProgress,
  Menu,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Select,
  MenuItem as SelectMenuItem,
  FormControl,
  InputLabel,
  InputAdornment,
  Grid, // Import Grid
} from '@mui/material';
import {
  Add as AddIcon,
  FilterList as FilterListIcon,
  MoreVert as MoreVertIcon,
  Search as SearchIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
} from '@mui/icons-material';
import { getFirestore, collection, addDoc, doc, deleteDoc, setDoc, updateDoc } from 'firebase/firestore';

// Current Date and Time (UTC - YYYY-MM-DD HH:MM:SS formatted): 2025-03-20 04:24:36
// Current User's Login: rAZAt922

function Loads({ loads, drivers, dispatchers, updateLoad, refreshData }) {
  // Initialize Firestore in useEffect instead of directly
  const [db, setDb] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    try {
      const firestore = getFirestore();
      setDb(firestore);
      console.log("getFirestore() called successfully");
    } catch (error) {
      console.error("Error calling getFirestore():", error);
      setError(error);
    }
  }, []);

  const [loading, setLoading] = useState(false);
  const [filterAnchorEl, setFilterAnchorEl] = useState(null);
  const [addLoadOpen, setAddLoadOpen] = useState(false);
  const [editLoadOpen, setEditLoadOpen] = useState(false);
  const [selectedLoad, setSelectedLoad] = useState(null);
  const [newLoad, setNewLoad] = useState({
    load_id: '',
    city: '',
    destination: '',
    totalMiles: '',
    rate: '',
    rpm: '',
    assigned_to: [],
    dispatcher: '',
    date: new Date().toISOString().slice(0, 10),
    status: 'Pending'
  });
  const [menuAnchorEl, setMenuAnchorEl] = useState(null);
  const isMenuOpen = Boolean(menuAnchorEl);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('All Loads'); // Track selected filter

  useEffect(() => {
    // You can fetch additional data here if needed
  }, []);

  const handleFilterClick = (event) => {
    setFilterAnchorEl(event.currentTarget);
  };

  const handleFilterClose = (filter) => {
    setFilterAnchorEl(null);
    setSelectedFilter(filter); // Update selected filter
  };

  const handleAddLoadOpen = () => {
    setAddLoadOpen(true);
  };

  const handleAddLoadClose = () => {
    setAddLoadOpen(false);
    setNewLoad({  // Reset newLoad state
      load_id: '',
      city: '',
      destination: '',
      totalMiles: '',
      rate: "",
      rpm: '',
      assigned_to: [], // Reset to empty array
      dispatcher: '',
      date: new Date().toISOString().slice(0, 10),
      status: 'Pending',
    });
  };

  const handleInputChange = (event) => {
    const { name, value } = event.target;
    setNewLoad(prevLoad => ({
      ...prevLoad,
      [name]: name === 'totalMiles' || name === 'rpm' ? String(value) : value
    }));
  };

  const handleDriverChange = (event) => {
    const selectedDrivers = event.target.value;
    setNewLoad(prevLoad => ({
      ...prevLoad,
      assigned_to: Array.isArray(selectedDrivers) ? selectedDrivers : [selectedDrivers]
    }));
    console.log("Driver change - newLoad:", {
      ...newLoad,
      assigned_to: Array.isArray(selectedDrivers) ? selectedDrivers : [selectedDrivers]
    });
  };

  const handleAddLoad = async () => {
    if (!db) return;

    try {
      console.log("Adding load to Firestore:", newLoad);
      const docRef = await addDoc(collection(db, "Loads"), {
        ...newLoad,
      });
      console.log("Document written with ID: ", docRef.id);

      // Create the complete load object with ID
      const newLoadWithId = {
        ...newLoad,
        id: docRef.id
      };

      // Update parent component's state
      updateLoad(newLoadWithId);

      handleAddLoadClose();
    } catch (e) {
      console.error("Error adding document: ", e);
      setError(e);
    }
  };

  // Update handleDeleteLoad to use updateLoad prop
  const handleDeleteLoad = async () => {
    if (selectedLoad && db) {
      try {
        console.log("Deleting load with ID:", selectedLoad.id);
        await deleteDoc(doc(db, "Loads", selectedLoad.id));
        console.log("Document successfully deleted!");

        // Update parent component's state with deleted flag
        updateLoad({ ...selectedLoad, deleted: true });

        handleMenuClose();
      } catch (error) {
        console.error("Error deleting document: ", error);
        setError(error);
      }
    }
  };

  const handleUpdateLoad = async () => {
    if (!newLoad?.id || !db) {
      console.error("Missing required data:", { 
        hasLoadId: Boolean(newLoad?.id), 
        hasDb: Boolean(db) 
      });
      return;
    }

    try {
      setLoading(true);
      console.log("Starting update for load:", newLoad.id);

      // Create the update object
      const updatedLoadData = {
        load_id: String(newLoad.load_id || ''),
        city: String(newLoad.city || ''),
        destination: String(newLoad.destination || ''),
        totalMiles: String(newLoad.totalMiles || ''),
        rate: String(newLoad.rate || ''),
        rpm: String(newLoad.rpm || ''),
        assigned_to: Array.isArray(newLoad.assigned_to) ? newLoad.assigned_to : [],
        dispatcher: String(newLoad.dispatcher || ''),
        date: String(newLoad.date || new Date().toISOString().slice(0, 10)),
        status: String(newLoad.status || 'Pending')
      };

      console.log("Updating with data:", updatedLoadData);

      // Update in Firestore
      const loadRef = doc(db, "Loads", newLoad.id);
      await setDoc(loadRef, updatedLoadData, { merge: true });

      // Create complete updated load object
      const completeUpdatedLoad = {
        id: newLoad.id,
        ...updatedLoadData
      };

      console.log("Update successful, calling updateLoad with:", completeUpdatedLoad);

      // Call the parent's updateLoad function
      updateLoad(completeUpdatedLoad);

      // Close the edit dialog
      handleEditLoadClose();
    } catch (error) {
      console.error("Error updating load:", error);
      setError("Failed to update load: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleEditLoadOpen = (load) => {
    if (!load) {
      console.error("No load provided to edit");
      setError("No load provided to edit");
      return;
    }

    console.log("Opening edit form for load:", load);
    setSelectedLoad(load);
    
    const formattedLoad = {
      ...load,
      load_id: String(load.load_id || ''),
      totalMiles: String(load.totalMiles || ''),
      rpm: String(load.rpm || ''),
      rate: String(load.rate || ''),
      assigned_to: Array.isArray(load.assigned_to) ? load.assigned_to : [],
      dispatcher: String(load.dispatcher || ''),
      destination: String(load.destination || ''),
      status: String(load.status || 'Pending'),
      city: String(load.city || ''),
      date: String(load.date || new Date().toISOString().slice(0, 10))
    };

    setNewLoad(formattedLoad);
    setEditLoadOpen(true);
  };

  const handleMenuOpen = (event, load) => {
    console.log("Menu opened for load:", load);
    event.stopPropagation(); // Prevent event bubbling
    setSelectedLoad(load);
    setMenuAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setMenuAnchorEl(null);
    setSelectedLoad(null);
  };

  const handleEditLoadClose = () => {
    setEditLoadOpen(false);
    // Don't reset selectedLoad immediately
    setTimeout(() => {
      setSelectedLoad(null);
      setNewLoad({
        load_id: '',
        city: '',
        destination: '',
        totalMiles: '',
        rate: '',
        rpm: '',
        assigned_to: [],
        dispatcher: '',
        date: new Date().toISOString().slice(0, 10),
        status: 'Pending'
      });
    }, 100);
  };

  const filteredLoads = useMemo(() => {
    return loads.filter(load => {
      const searchTermLower = searchTerm.toLowerCase();
      const searchMatch =
        load.load_id?.toLowerCase().includes(searchTermLower) ||
        load.city?.toLowerCase().includes(searchTermLower) ||
        load.destination?.toLowerCase().includes(searchTermLower);

      const filterMatch =
        selectedFilter === 'All Loads' ||
        load.status === selectedFilter ||
        (selectedFilter === 'Unassigned' && (!load.assigned_to || load.assigned_to.length === 0)); // Handle "Unassigned" filter

      return searchMatch && filterMatch;
    });
  }, [loads, searchTerm, selectedFilter]);

  useEffect(() => {
    console.log("Selected load updated:", selectedLoad);
    if (selectedLoad) {
      setNewLoad(prev => ({
        ...prev,
        ...selectedLoad,
        assigned_to: Array.isArray(selectedLoad.assigned_to) 
          ? selectedLoad.assigned_to 
          : [],
        load_id: String(selectedLoad.load_id || ''),
        totalMiles: String(selectedLoad.totalMiles || ''),
        rpm: String(selectedLoad.rpm || ''),
        rate: String(selectedLoad.rate || '')
      }));
    }
  }, [selectedLoad]);

  useEffect(() => {
    if (error) {
      // You could show a snackbar or other error notification here
      console.error("Operation failed:", error);
    }
  }, [error]);

  console.log("First load object:", JSON.stringify(loads[0], null, 2)); // Log the first load object
  console.log("Rendering Loads component with loads:", loads, "drivers:", drivers, "dispatchers:", dispatchers); // Log the props being received

  return (
    <Container maxWidth="xl">
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4">Loads</Typography>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <TextField
            size="small"
            label="Search Loads"
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
            }}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            sx={{ mr: 2 }}
          />
          <Button
            variant="outlined"
            startIcon={<FilterListIcon />}
            onClick={handleFilterClick}
            sx={{ mr: 1 }}
          >
            Filter
          </Button>
          <Menu
            anchorEl={filterAnchorEl}
            open={Boolean(filterAnchorEl)}
            onClose={() => handleFilterClose(selectedFilter)} // Close with current filter
          >
            <MenuItem onClick={() => handleFilterClose('All Loads')}>All Loads</MenuItem>
            <MenuItem onClick={() => handleFilterClose('In Transit')}>In Transit</MenuItem>
            <MenuItem onClick={() => handleFilterClose('Pending')}>Pending</MenuItem>
            <MenuItem onClick={() => handleFilterClose('Delivered')}>Delivered</MenuItem>
            <MenuItem onClick={() => handleFilterClose('Unassigned')}>Unassigned</MenuItem>
          </Menu>
          <Button variant="contained" startIcon={<AddIcon />} onClick={handleAddLoadOpen}>
            Add Load
          </Button>
        </Box>
      </Box>

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', my: 4, position: 'relative' }}>
          <CircularProgress />
        </Box>
      ) : (
        <Paper sx={{ borderRadius: 2, overflow: 'hidden', position: 'relative' }}>
          {loading && (
            <Box sx={{ 
              position: 'absolute', 
              top: 0, 
              left: 0, 
              right: 0, 
              bottom: 0, 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center',
              backgroundColor: 'rgba(255, 255, 255, 0.7)' 
            }}>
              <CircularProgress />
            </Box>
          )}
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Load ID & Date</TableCell>
                  <TableCell>Route</TableCell>
                  <TableCell>Driver</TableCell>
                  <TableCell>Dispatcher</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Rate</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredLoads.map((load) => (
                  <TableRow 
                    key={load.id} 
                    sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                  >
                    <TableCell>
                      <Typography variant="body2" sx={{ fontWeight: 'medium' }}>{load.load_id}</Typography>
                      <Typography variant="caption" color="text.secondary">{load.date}</Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">{load.city}</Typography>
                      <Typography variant="caption" color="text.secondary">to {load.destination}</Typography>
                    </TableCell>
                    <TableCell>
                      {load.assigned_to && load.assigned_to.length > 0 ? (
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          {load.assigned_to.map(driverName => {
                            const driver = drivers.find(d => d.name === driverName);
                            return driver ? (
                              <Box key={driver.id} sx={{ display: 'flex', alignItems: 'center', mr: 1 }}>
                                <Avatar sx={{ width: 24, height: 24, fontSize: '0.75rem', mr: 1 }}>
                                  {driver.avatar}
                                </Avatar>
                                <Typography variant="body2">
                                  {driver.name}
                                </Typography>
                              </Box>
                            ) : null;
                          })}
                        </Box>
                      ) : (
                        <Chip label="Unassigned" size="small" color="default" />
                      )}
                    </TableCell>
                    <TableCell>
                      {load.dispatcher ? (
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                           <Avatar sx={{ width: 24, height: 24, fontSize: '0.75rem', mr: 1 }}>
                            {dispatchers.find(d => d.name === load.dispatcher)?.avatar}
                          </Avatar>
                          <Typography variant="body2">
                            {dispatchers.find(d => d.name === load.dispatcher)?.name}
                          </Typography>
                        </Box>
                      ) : (
                        <Chip label="Unassigned" size="small" color="default" />
                      )}
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={load.status}
                        size="small"
                        color={
                          load.status === "Delivered" ? "success" :
                            load.status === "In Transit" ? "warning" :
                              load.status === "Pending" ? "primary" : "default"
                        }
                      />
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" sx={{ fontWeight: 'bold' }}>{load.rate}</Typography>
                    </TableCell>
                    <TableCell>
                      <IconButton size="small" onClick={(event) => handleMenuOpen(event, load)}>
                        <MoreVertIcon fontSize="small" />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>
      )}

      {/* Add Load Dialog */}
      <Dialog open={addLoadOpen} onClose={handleAddLoadClose} fullWidth maxWidth="sm">
        <DialogTitle>Add New Load</DialogTitle>
        <DialogContent>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <TextField
                margin="dense"
                label="Load ID"
                type="text"
                fullWidth
                name="load_id"
                value={newLoad.load_id}
                onChange={handleInputChange}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                autoFocus
                margin="dense"
                label="Origin City"
                type="text"
                fullWidth
                name="city"
                value={newLoad.city}
                onChange={handleInputChange}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                margin="dense"
                label="Destination"
                type="text"
                fullWidth
                name="destination"
                value={newLoad.destination}
                onChange={handleInputChange}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                margin="dense"
                label="Total Miles"
                type="number"
                fullWidth
                name="totalMiles"
                value={newLoad.totalMiles}
                onChange={handleInputChange}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                margin="dense"
                label="Rate"
                type="text"
                fullWidth
                name="rate"
                value={newLoad.rate}
                onChange={handleInputChange}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                margin="dense"
                label="RPM"
                type="number"
                fullWidth
                name="rpm"
                value={newLoad.rpm}
                onChange={handleInputChange}
              />
            </Grid>
             <Grid item xs={12} sm={6}>
              <FormControl fullWidth margin="dense">
                <InputLabel id="driver-select-label">Driver(s)</InputLabel>
                <Select
                  labelId="driver-select-label"
                  id="driver-select"
                  name="assigned_to"
                  value={newLoad.assigned_to || []}
                  onChange={handleDriverChange}
                  multiple
                >
                  {drivers.map((driver) => (
                    <SelectMenuItem key={driver.id} value={driver.name}>
                      {driver.name}
                    </SelectMenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth margin="dense">
                <InputLabel id="dispatcher-select-label">Dispatcher</InputLabel>
                <Select
                  labelId="dispatcher-select-label"
                  id="dispatcher-select"
                  name="dispatcher"
                  value={newLoad.dispatcher}
                  onChange={handleInputChange}
                >
                  <SelectMenuItem value="">
                    <em>None</em>
                  </SelectMenuItem>
                  {dispatchers.map((dispatcher) => (
                    <SelectMenuItem key={dispatcher.id} value={dispatcher.name}>
                      {dispatcher.name}
                    </SelectMenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth margin="dense">
                <InputLabel id="status-select-label">Status</InputLabel>
                <Select
                  labelId="status-select-label"
                  id="driver-select"
                  name="status"
                  value={newLoad.status}
                  onChange={handleInputChange}
                >
                  <SelectMenuItem value="Pending">Pending</SelectMenuItem>
                  <SelectMenuItem value="In Transit">In Transit</SelectMenuItem>
                  <SelectMenuItem value="Delivered">Delivered</SelectMenuItem>
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleAddLoadClose} disabled={loading}>Cancel</Button>
          <Button onClick={handleAddLoad} disabled={loading} variant="contained">
            {loading ? 'Adding...' : 'Add Load'}
          </Button>
        </DialogActions>
      </Dialog>

     {/* Edit Load Dialog */}
      <Dialog open={editLoadOpen} onClose={handleEditLoadClose} fullWidth maxWidth="sm">
        <DialogTitle>Edit Load</DialogTitle>
        <DialogContent sx={{ position: 'relative' }}>
          {loading && (
            <Box sx={{ 
              position: 'absolute', 
              top: 0, 
              left: 0, 
              right: 0, 
              bottom: 0, 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center',
              backgroundColor: 'rgba(255, 255, 255, 0.7)' 
            }}>
              <CircularProgress />
            </Box>
          )}
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <TextField
                margin="dense"
                label="Load ID"
                type="text"
                fullWidth
                name="load_id"
                value={newLoad.load_id}
                onChange={handleInputChange}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                autoFocus
                margin="dense"
                label="Origin City"
                type="text"
                fullWidth
                name="city"
                value={newLoad.city}
                onChange={handleInputChange}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                margin="dense"
                label="Destination"
                type="text"
                fullWidth
                name="destination"
                value={newLoad.destination}
                onChange={handleInputChange}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                margin="dense"
                label="Total Miles"
                type="number"
                fullWidth
                name="totalMiles"
                value={newLoad.totalMiles}
                onChange={handleInputChange}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                margin="dense"
                label="Rate"
                type="text"
                fullWidth
                name="rate"
                value={newLoad.rate}
                onChange={handleInputChange}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                margin="dense"
                label="RPM"
                type="number"
                fullWidth
                name="rpm"
                value={newLoad.rpm}
                onChange={handleInputChange}
              />
            </Grid>
             <Grid item xs={12} sm={6}>
              <FormControl fullWidth margin="dense">
                <InputLabel id="driver-select-label">Driver(s)</InputLabel>
                <Select
                  labelId="driver-select-label"
                  id="driver-select"
                  name="assigned_to"
                  value={newLoad.assigned_to || []}
                  onChange={handleDriverChange}
                  multiple
                >
                  {drivers.map((driver) => (
                    <SelectMenuItem key={driver.id} value={driver.name}>
                      {driver.name}
                    </SelectMenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth margin="dense">
                <InputLabel id="dispatcher-select-label">Dispatcher</InputLabel>
                <Select
                  labelId="dispatcher-select-label"
                  id="dispatcher-select"
                  name="dispatcher"
                  value={newLoad.dispatcher}
                  onChange={handleInputChange}
                >
                  <SelectMenuItem value="">
                    <em>None</em>
                  </SelectMenuItem>
                  {dispatchers.map((dispatcher) => (
                    <SelectMenuItem key={dispatcher.id} value={dispatcher.name}>
                      {dispatcher.name}
                    </SelectMenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth margin="dense">
                <InputLabel id="status-select-label">Status</InputLabel>
                <Select
                  labelId="status-select-label"
                  id="driver-select"
                  name="status"
                  value={newLoad.status}
                  onChange={handleInputChange}
                >
                  <SelectMenuItem value="Pending">Pending</SelectMenuItem>
                  <SelectMenuItem value="In Transit">In Transit</SelectMenuItem>
                  <SelectMenuItem value="Delivered">Delivered</SelectMenuItem>
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleEditLoadClose} disabled={loading}>
            Cancel
          </Button>
          <Button 
            onClick={handleUpdateLoad}
            disabled={loading || !newLoad?.id || !db}
            variant="contained"
            color="primary"
          >
            {loading ? 'Updating...' : 'Update Load'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Menu for Edit/Delete */}
      <Menu
        anchorEl={menuAnchorEl}
        open={isMenuOpen}
        onClose={handleMenuClose}
      >
        <MenuItem onClick={() => {
          if (selectedLoad) {
            handleEditLoadOpen(selectedLoad);
            handleMenuClose();
          }
        }}>
          <EditIcon sx={{ mr: 1 }} /> Edit
        </MenuItem>
        <MenuItem onClick={() => { 
          if (selectedLoad) {
            handleDeleteLoad(); 
            handleMenuClose();
          }
        }}>
          <DeleteIcon sx={{ mr: 1 }} />
          Delete Load
        </MenuItem>
      </Menu>
    </Container>
  );
}

export default Loads;