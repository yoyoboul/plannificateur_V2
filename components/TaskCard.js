import { useState } from 'react';
import {
  Card,
  CardContent,
  Typography,
  Chip,
  Box,
  IconButton,
  Menu,
  MenuItem,
  Divider,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  useTheme,
} from '@mui/material';
import {
  MoreVert as MoreIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Event as EventIcon,
  EventBusy as EventBusyIcon,
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import dayjs from 'dayjs';

// Fonctions utilitaires
const formatDuration = (days) => {
  if (days >= 1) {
    return `${days} jour${days > 1 ? 's' : ''}`;
  } else {
    const hours = days * 8; // 8 heures de travail par jour
    return `${hours} heure${hours > 1 ? 's' : ''}`;
  }
};

const getStatusColor = (status) => {
  switch (status) {
    case 'À faire':
      return 'error';
    case 'En cours':
      return 'warning';
    case 'En attente':
      return 'info';
    case 'Terminé':
      return 'success';
    default:
      return 'default';
  }
};

const getPriorityColor = (priority) => {
  switch (priority) {
    case 'Élevée':
      return 'error';
    case 'Moyenne':
      return 'warning';
    case 'Basse':
      return 'info';
    case 'Faible':
      return 'success';
    default:
      return 'default';
  }
};

export default function TaskCard({ task, onStatusChange, onEdit, onDelete, onSchedule, onUnschedule }) {
  const theme = useTheme();
  const [anchorEl, setAnchorEl] = useState(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [scheduleDialogOpen, setScheduleDialogOpen] = useState(false);
  const [editedTask, setEditedTask] = useState({ ...task });
  const [startDate, setStartDate] = useState(
    task.date_début ? dayjs(task.date_début) : dayjs()
  );
  const [duration, setDuration] = useState(task.durée_estimée || 1);

  const handleMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleEditClick = () => {
    setEditedTask({ ...task });
    setEditDialogOpen(true);
    handleMenuClose();
  };

  const handleEditDialogClose = () => {
    setEditDialogOpen(false);
  };

  const handleSaveEdit = () => {
    onEdit(task.zone, task.titre, editedTask);
    setEditDialogOpen(false);
  };

  const handleDeleteClick = () => {
    onDelete(task.zone, task.titre);
    handleMenuClose();
  };

  const handleScheduleClick = () => {
    setScheduleDialogOpen(true);
    handleMenuClose();
  };

  const handleScheduleDialogClose = () => {
    setScheduleDialogOpen(false);
  };

  const handleSaveSchedule = () => {
    onSchedule(task.zone, task.titre, startDate.toISOString(), parseFloat(duration));
    setScheduleDialogOpen(false);
  };

  const handleUnscheduleClick = () => {
    onUnschedule(task.zone, task.titre);
    handleMenuClose();
  };

  const handleStatusChange = (event) => {
    onStatusChange(task.zone, task.titre, event.target.value);
  };

  const isScheduled = Boolean(task.date_début && task.date_fin);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="task-card"
    >
      <Card
        sx={{
          position: 'relative',
          borderLeft: `4px solid ${theme.palette[getStatusColor(task.statut)].main}`,
          mb: 2,
        }}
      >
        <CardContent>
          <Box display="flex" justifyContent="space-between" alignItems="flex-start">
            <Typography variant="h6" component="div" gutterBottom>
              {task.titre}
            </Typography>
            <IconButton size="small" onClick={handleMenuOpen}>
              <MoreIcon />
            </IconButton>
          </Box>

          <Menu
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={handleMenuClose}
            anchorOrigin={{
              vertical: 'bottom',
              horizontal: 'right',
            }}
            transformOrigin={{
              vertical: 'top',
              horizontal: 'right',
            }}
          >
            <MenuItem onClick={handleEditClick}>
              <EditIcon fontSize="small" sx={{ mr: 1 }} />
              Modifier
            </MenuItem>
            {isScheduled ? (
              <MenuItem onClick={handleUnscheduleClick}>
                <EventBusyIcon fontSize="small" sx={{ mr: 1 }} />
                Déplanifier
              </MenuItem>
            ) : (
              <MenuItem onClick={handleScheduleClick}>
                <EventIcon fontSize="small" sx={{ mr: 1 }} />
                Planifier
              </MenuItem>
            )}
            <Divider />
            <MenuItem onClick={handleDeleteClick} sx={{ color: 'error.main' }}>
              <DeleteIcon fontSize="small" sx={{ mr: 1 }} />
              Supprimer
            </MenuItem>
          </Menu>

          <Box display="flex" flexWrap="wrap" gap={1} mt={1} mb={2}>
            <Chip
              label={task.zone}
              size="small"
              variant="outlined"
              sx={{ borderRadius: 1 }}
            />
            <Chip
              label={task.statut}
              size="small"
              color={getStatusColor(task.statut)}
              className="status-chip"
              sx={{ borderRadius: 1 }}
            />
            <Chip
              label={`Priorité: ${task.priorité}`}
              size="small"
              color={getPriorityColor(task.priorité)}
              sx={{ borderRadius: 1 }}
            />
          </Box>

          <Box display="flex" justifyContent="space-between" alignItems="center">
            <Typography variant="body2" color="text.secondary">
              Durée: {formatDuration(task.durée_estimée)}
            </Typography>
            
            {isScheduled && (
              <Typography variant="body2" color="text.secondary">
                {`${new Date(task.date_début).toLocaleDateString()} - ${new Date(task.date_fin).toLocaleDateString()}`}
              </Typography>
            )}

            <FormControl size="small" variant="outlined" sx={{ minWidth: 120 }}>
              <Select
                value={task.statut}
                onChange={handleStatusChange}
                sx={{
                  fontSize: '0.8rem',
                  height: '32px',
                }}
              >
                <MenuItem value="À faire">À faire</MenuItem>
                <MenuItem value="En cours">En cours</MenuItem>
                <MenuItem value="En attente">En attente</MenuItem>
                <MenuItem value="Terminé">Terminé</MenuItem>
              </Select>
            </FormControl>
          </Box>
        </CardContent>
      </Card>

      {/* Dialogue de modification */}
      <Dialog open={editDialogOpen} onClose={handleEditDialogClose} fullWidth maxWidth="sm">
        <DialogTitle>Modifier la tâche</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Titre"
            fullWidth
            variant="outlined"
            value={editedTask.titre}
            onChange={(e) => setEditedTask({ ...editedTask, titre: e.target.value })}
            sx={{ mb: 2 }}
          />
          <FormControl fullWidth margin="dense" sx={{ mb: 2 }}>
            <InputLabel>Priorité</InputLabel>
            <Select
              value={editedTask.priorité}
              label="Priorité"
              onChange={(e) => setEditedTask({ ...editedTask, priorité: e.target.value })}
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
            value={editedTask.durée_estimée}
            onChange={(e) => setEditedTask({ ...editedTask, durée_estimée: parseFloat(e.target.value) })}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleEditDialogClose}>Annuler</Button>
          <Button onClick={handleSaveEdit} variant="contained" color="primary">
            Enregistrer
          </Button>
        </DialogActions>
      </Dialog>

      {/* Dialogue de planification */}
      <Dialog open={scheduleDialogOpen} onClose={handleScheduleDialogClose} fullWidth maxWidth="sm">
        <DialogTitle>Planifier la tâche</DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2 }}>
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
        </DialogContent>
        <DialogActions>
          <Button onClick={handleScheduleDialogClose}>Annuler</Button>
          <Button onClick={handleSaveSchedule} variant="contained" color="primary">
            Planifier
          </Button>
        </DialogActions>
      </Dialog>
    </motion.div>
  );
} 