import { useState, useEffect } from 'react';
import {
  Typography,
  Box,
  Grid,
  Card,
  CardContent,
  Tabs,
  Tab,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  IconButton,
  Paper,
  Divider,
} from '@mui/material';
import { Add as AddIcon, FilterList as FilterIcon } from '@mui/icons-material';
import Layout from '../components/Layout';
import TaskCard from '../components/TaskCard';
import { motion } from 'framer-motion';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import dayjs from 'dayjs';

export default function TravauxPage() {
  const [tasks, setTasks] = useState([]);
  const [zones, setZones] = useState([]);
  const [filteredTasks, setFilteredTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tabValue, setTabValue] = useState(0);
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [newTask, setNewTask] = useState({
    titre: '',
    statut: 'À faire',
    priorité: 'Moyenne',
    durée_estimée: 1,
  });
  const [selectedZone, setSelectedZone] = useState('');
  const [scheduleDialogOpen, setScheduleDialogOpen] = useState(false);
  const [taskToSchedule, setTaskToSchedule] = useState(null);
  const [startDate, setStartDate] = useState(dayjs());
  const [duration, setDuration] = useState(1);

  useEffect(() => {
    // Charger les tâches et les zones
    const fetchData = async () => {
      try {
        const [tasksRes, zonesRes] = await Promise.all([
          fetch('/api/tasks'),
          fetch('/api/zones'),
        ]);

        const [tasksData, zonesData] = await Promise.all([
          tasksRes.json(),
          zonesRes.json(),
        ]);

        setTasks(tasksData);
        setFilteredTasks(tasksData);
        setZones(zonesData);
        
        if (zonesData.length > 0) {
          setSelectedZone(zonesData[0]);
        }
      } catch (error) {
        console.error('Erreur lors du chargement des données:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
    
    if (newValue === 0) {
      // Tous les travaux
      setFilteredTasks(tasks);
    } else {
      // Filtrer par statut
      const statuses = ['À faire', 'En cours', 'En attente', 'Terminé'];
      const selectedStatus = statuses[newValue - 1];
      setFilteredTasks(tasks.filter(task => task.statut === selectedStatus));
    }
  };

  const handleAddDialogOpen = () => {
    setAddDialogOpen(true);
  };

  const handleAddDialogClose = () => {
    setAddDialogOpen(false);
    // Réinitialiser le formulaire
    setNewTask({
      titre: '',
      statut: 'À faire',
      priorité: 'Moyenne',
      durée_estimée: 1,
    });
  };

  const handleAddTask = async () => {
    if (!newTask.titre || !selectedZone) {
      return;
    }

    try {
      const response = await fetch('/api/tasks', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          zone: selectedZone,
          task: newTask,
        }),
      });

      if (response.ok) {
        // Recharger les tâches
        const tasksRes = await fetch('/api/tasks');
        const tasksData = await tasksRes.json();
        setTasks(tasksData);
        
        // Appliquer le filtre actuel
        if (tabValue === 0) {
          setFilteredTasks(tasksData);
        } else {
          const statuses = ['À faire', 'En cours', 'En attente', 'Terminé'];
          const selectedStatus = statuses[tabValue - 1];
          setFilteredTasks(tasksData.filter(task => task.statut === selectedStatus));
        }
        
        handleAddDialogClose();
      }
    } catch (error) {
      console.error('Erreur lors de l\'ajout de la tâche:', error);
    }
  };

  const handleStatusChange = async (zone, titre, newStatus) => {
    try {
      // Utiliser le nouvel endpoint qui gère mieux les zones avec slashes
      const response = await fetch(`/api/tasks-update`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          zone: zone,
          titre: titre,
          action: 'updateStatus',
          status: newStatus,
        }),
      });

      if (response.ok) {
        // Mettre à jour localement
        const updatedTasks = tasks.map(task => {
          if (task.zone === zone && task.titre === titre) {
            return { ...task, statut: newStatus };
          }
          return task;
        });
        
        setTasks(updatedTasks);
        
        // Appliquer le filtre actuel
        if (tabValue === 0) {
          setFilteredTasks(updatedTasks);
        } else {
          const statuses = ['À faire', 'En cours', 'En attente', 'Terminé'];
          const selectedStatus = statuses[tabValue - 1];
          setFilteredTasks(updatedTasks.filter(task => task.statut === selectedStatus));
        }
      } else {
        console.error('Erreur lors de la mise à jour du statut:', await response.text());
      }
    } catch (error) {
      console.error('Erreur lors de la mise à jour du statut:', error);
    }
  };

  const handleEdit = async (zone, titre, updatedTask) => {
    try {
      const response = await fetch(`/api/tasks-update`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          zone: zone,
          titre: titre,
          action: 'update',
          ...updatedTask
        }),
      });

      if (response.ok) {
        // Mettre à jour localement
        const updatedTasks = tasks.map(task => {
          if (task.zone === zone && task.titre === titre) {
            return { ...task, ...updatedTask };
          }
          return task;
        });
        
        setTasks(updatedTasks);
        
        // Appliquer le filtre actuel
        if (tabValue === 0) {
          setFilteredTasks(updatedTasks);
        } else {
          const statuses = ['À faire', 'En cours', 'En attente', 'Terminé'];
          const selectedStatus = statuses[tabValue - 1];
          setFilteredTasks(updatedTasks.filter(task => task.statut === selectedStatus));
        }
      } else {
        console.error('Erreur lors de la mise à jour de la tâche:', await response.text());
      }
    } catch (error) {
      console.error('Erreur lors de la mise à jour de la tâche:', error);
    }
  };

  const handleDelete = async (zone, titre) => {
    try {
      const response = await fetch(`/api/tasks-update`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          zone: zone,
          titre: titre,
          action: 'delete'
        }),
      });

      if (response.ok) {
        // Mettre à jour localement
        const updatedTasks = tasks.filter(task => !(task.zone === zone && task.titre === titre));
        
        setTasks(updatedTasks);
        
        // Appliquer le filtre actuel
        if (tabValue === 0) {
          setFilteredTasks(updatedTasks);
        } else {
          const statuses = ['À faire', 'En cours', 'En attente', 'Terminé'];
          const selectedStatus = statuses[tabValue - 1];
          setFilteredTasks(updatedTasks.filter(task => task.statut === selectedStatus));
        }
      } else {
        console.error('Erreur lors de la suppression de la tâche:', await response.text());
      }
    } catch (error) {
      console.error('Erreur lors de la suppression de la tâche:', error);
    }
  };

  const handleScheduleDialogOpen = (task) => {
    setTaskToSchedule(task);
    setStartDate(dayjs());
    setDuration(task.durée_estimée || 1);
    setScheduleDialogOpen(true);
  };

  const handleScheduleDialogClose = () => {
    setScheduleDialogOpen(false);
    setTaskToSchedule(null);
  };

  const handleScheduleTask = async () => {
    if (!taskToSchedule) return;

    try {
      const response = await fetch(`/api/tasks-update`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          zone: taskToSchedule.zone,
          titre: taskToSchedule.titre,
          action: 'schedule',
          startDate: startDate.toISOString(),
          duration: parseFloat(duration),
        }),
      });

      if (response.ok) {
        // Recharger les tâches
        const tasksRes = await fetch('/api/tasks');
        const tasksData = await tasksRes.json();
        setTasks(tasksData);
        
        // Appliquer le filtre actuel
        if (tabValue === 0) {
          setFilteredTasks(tasksData);
        } else {
          const statuses = ['À faire', 'En cours', 'En attente', 'Terminé'];
          const selectedStatus = statuses[tabValue - 1];
          setFilteredTasks(tasksData.filter(task => task.statut === selectedStatus));
        }
        
        handleScheduleDialogClose();
      } else {
        console.error('Erreur lors de la planification de la tâche:', await response.text());
      }
    } catch (error) {
      console.error('Erreur lors de la planification de la tâche:', error);
    }
  };

  const handleUnscheduleTask = async (zone, titre) => {
    try {
      const response = await fetch(`/api/tasks-update`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          zone: zone,
          titre: titre,
          action: 'unschedule',
        }),
      });

      if (response.ok) {
        // Recharger les tâches
        const tasksRes = await fetch('/api/tasks');
        const tasksData = await tasksRes.json();
        setTasks(tasksData);
        
        // Appliquer le filtre actuel
        if (tabValue === 0) {
          setFilteredTasks(tasksData);
        } else {
          const statuses = ['À faire', 'En cours', 'En attente', 'Terminé'];
          const selectedStatus = statuses[tabValue - 1];
          setFilteredTasks(tasksData.filter(task => task.statut === selectedStatus));
        }
      } else {
        console.error('Erreur lors de la déplanification de la tâche:', await response.text());
      }
    } catch (error) {
      console.error('Erreur lors de la déplanification de la tâche:', error);
    }
  };

  return (
    <Layout>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Liste des travaux
        </Typography>
        <Typography variant="subtitle1" color="text.secondary" gutterBottom>
          Consultez et gérez toutes vos tâches de rénovation
        </Typography>
      </Box>

      {/* Filtres et bouton d'ajout */}
      <Box 
        sx={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center', 
          mb: 3,
          flexDirection: { xs: 'column', sm: 'row' },
          gap: 2
        }}
      >
        <Tabs 
          value={tabValue} 
          onChange={handleTabChange}
          variant="scrollable"
          scrollButtons="auto"
          sx={{ 
            backgroundColor: 'background.paper', 
            borderRadius: 1,
            boxShadow: 1,
            minHeight: 48,
            width: { xs: '100%', sm: 'auto' }
          }}
        >
          <Tab label="Tous" />
          <Tab label="À faire" />
          <Tab label="En cours" />
          <Tab label="En attente" />
          <Tab label="Terminés" />
        </Tabs>
        
        <Button
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
          onClick={handleAddDialogOpen}
          sx={{ minWidth: 200 }}
        >
          Ajouter une tâche
        </Button>
      </Box>

      {/* Liste des tâches */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <Grid container spacing={2}>
          {filteredTasks.length > 0 ? (
            filteredTasks.map((task) => (
              <Grid item xs={12} key={`${task.zone}-${task.titre}`}>
                <TaskCard
                  task={task}
                  onStatusChange={handleStatusChange}
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                  onSchedule={(zone, titre, startDate, duration) => {
                    setTaskToSchedule(task);
                    setStartDate(dayjs(startDate));
                    setDuration(duration);
                    handleScheduleTask();
                  }}
                  onUnschedule={handleUnscheduleTask}
                />
              </Grid>
            ))
          ) : (
            <Grid item xs={12}>
              <Paper sx={{ p: 3, textAlign: 'center' }}>
                <Typography variant="body1">
                  Aucune tâche trouvée avec les filtres actuels.
                </Typography>
              </Paper>
            </Grid>
          )}
        </Grid>
      </motion.div>

      {/* Dialogue d'ajout de tâche */}
      <Dialog open={addDialogOpen} onClose={handleAddDialogClose} fullWidth maxWidth="sm">
        <DialogTitle>Ajouter une nouvelle tâche</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Titre de la tâche"
            fullWidth
            variant="outlined"
            value={newTask.titre}
            onChange={(e) => setNewTask({ ...newTask, titre: e.target.value })}
            sx={{ mb: 2, mt: 1 }}
          />
          
          <FormControl fullWidth margin="dense" sx={{ mb: 2 }}>
            <InputLabel>Zone</InputLabel>
            <Select
              value={selectedZone}
              label="Zone"
              onChange={(e) => setSelectedZone(e.target.value)}
            >
              {zones.map((zone) => (
                <MenuItem key={zone} value={zone}>
                  {zone}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          
          <FormControl fullWidth margin="dense" sx={{ mb: 2 }}>
            <InputLabel>Priorité</InputLabel>
            <Select
              value={newTask.priorité}
              label="Priorité"
              onChange={(e) => setNewTask({ ...newTask, priorité: e.target.value })}
            >
              <MenuItem value="Élevée">Élevée</MenuItem>
              <MenuItem value="Moyenne">Moyenne</MenuItem>
              <MenuItem value="Basse">Basse</MenuItem>
              <MenuItem value="Faible">Faible</MenuItem>
            </Select>
          </FormControl>
          
          <TextField
            margin="dense"
            label="Durée estimée (jours)"
            fullWidth
            variant="outlined"
            type="number"
            inputProps={{ min: 0.1, step: 0.1 }}
            value={newTask.durée_estimée}
            onChange={(e) => setNewTask({ ...newTask, durée_estimée: parseFloat(e.target.value) })}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleAddDialogClose}>Annuler</Button>
          <Button onClick={handleAddTask} variant="contained" color="primary">
            Ajouter
          </Button>
        </DialogActions>
      </Dialog>

      {/* Dialogue de planification */}
      <Dialog open={scheduleDialogOpen} onClose={handleScheduleDialogClose} fullWidth maxWidth="sm">
        <DialogTitle>Planifier la tâche</DialogTitle>
        <DialogContent>
          {taskToSchedule && (
            <Box sx={{ mt: 2 }}>
              <Typography variant="subtitle1" gutterBottom>
                {taskToSchedule.titre}
              </Typography>
              <Divider sx={{ mb: 3 }} />
              <DatePicker
                label="Date de début"
                value={startDate}
                onChange={(newValue) => setStartDate(newValue)}
                sx={{ width: '100%', mb: 3 }}
              />
              <TextField
                margin="dense"
                label="Durée (jours)"
                fullWidth
                variant="outlined"
                type="number"
                inputProps={{ min: 0.1, step: 0.1 }}
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
              />
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleScheduleDialogClose}>Annuler</Button>
          <Button onClick={handleScheduleTask} variant="contained" color="primary">
            Planifier
          </Button>
        </DialogActions>
      </Dialog>
    </Layout>
  );
} 