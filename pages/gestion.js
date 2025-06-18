import { useState, useEffect } from 'react';
import {
  Typography,
  Box,
  TextField,
  Button,
  List,
  ListItem,
  ListItemText,
  IconButton,
  Divider,
  Paper,
} from '@mui/material';
import { Delete as DeleteIcon } from '@mui/icons-material';
import Layout from '../components/Layout';

export default function GestionPage() {
  const [zones, setZones] = useState([]);
  const [newZone, setNewZone] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchZones = async () => {
      try {
        const res = await fetch('/api/zones');
        const data = await res.json();
        setZones(data);
      } catch (error) {
        console.error('Erreur lors du chargement des zones:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchZones();
  }, []);

  const handleAddZone = async () => {
    if (!newZone.trim()) return;

    try {
      const res = await fetch('/api/zones', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newZone.trim() }),
      });

      if (res.ok) {
        setZones([...zones, newZone.trim()]);
        setNewZone('');
      } else {
        console.error('Erreur lors de l\'ajout de la zone:', await res.text());
      }
    } catch (error) {
      console.error('Erreur lors de l\'ajout de la zone:', error);
    }
  };

  const handleDeleteZone = async (zone) => {
    try {
      const res = await fetch(`/api/zones/${encodeURIComponent(zone)}`, {
        method: 'DELETE',
      });

      if (res.ok) {
        setZones(zones.filter((z) => z !== zone));
      } else {
        console.error('Erreur lors de la suppression de la zone:', await res.text());
      }
    } catch (error) {
      console.error('Erreur lors de la suppression de la zone:', error);
    }
  };

  return (
    <Layout>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Gestion des zones
        </Typography>
        <Typography variant="subtitle1" color="text.secondary" gutterBottom>
          Ajoutez ou supprimez des zones pour organiser vos tâches
        </Typography>
      </Box>

      <Paper sx={{ p: 3, mb: 4 }}>
        <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
          <TextField
            label="Nouvelle zone"
            value={newZone}
            onChange={(e) => setNewZone(e.target.value)}
            fullWidth
          />
          <Button variant="contained" color="primary" onClick={handleAddZone}>
            Ajouter
          </Button>
        </Box>
        <Divider />
        <List>
          {zones.map((zone) => (
            <ListItem
              key={zone}
              secondaryAction={
                <IconButton edge="end" aria-label="delete" onClick={() => handleDeleteZone(zone)}>
                  <DeleteIcon />
                </IconButton>
              }
            >
              <ListItemText primary={zone} />
            </ListItem>
          ))}
          {zones.length === 0 && !loading && (
            <ListItem>
              <ListItemText primary="Aucune zone définie" />
            </ListItem>
          )}
        </List>
      </Paper>
    </Layout>
  );
}
