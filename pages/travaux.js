import { useState, useEffect } from 'react';
import {
  Typography,
  Box,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  List,
  ListItem,
  ListItemText,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import { Add as AddIcon, Delete as DeleteIcon } from '@mui/icons-material';
import Layout from '../components/Layout';
import dayjs from 'dayjs';

export default function CoursesPage() {
  /* ------------------ Responsive ------------------ */
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  /* ------------------ State ------------------ */
  const emptyItem = {
    magasin: '',
    produit: '',
    lien: '',
    prix: '',
    date: dayjs().format('YYYY-MM-DD'),
  };
  const [items, setItems] = useState([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [newItem, setNewItem] = useState(emptyItem);

  /* ------------------ Data ------------------ */
  const fetchItems = async () => {
    try {
      const res = await fetch('/api/shopping');
      const data = await res.json();
      setItems(data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchItems();
  }, []);

  const handleAdd = async () => {
    if (!newItem.produit) return;
    await fetch('/api/shopping', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newItem),
    });
    setDialogOpen(false);
    setNewItem(emptyItem);
    fetchItems();
  };

  const handleDelete = async id => {
    await fetch(`/api/shopping/${id}`, { method: 'DELETE' });
    fetchItems();
  };

  /* ------------------ Render helpers ------------------ */
  const renderMobileList = () => (
    <List>
      {items.map(item => (
        <ListItem
          key={item._id}
          divider
          sx={{ flexDirection: 'column', alignItems: 'flex-start' }}
        >
          <Box
            display="flex"
            width="100%"
            justifyContent="space-between"
            alignItems="center"
          >
            <Typography variant="body2">
              {dayjs(item.date).format('DD/MM/YYYY')}
            </Typography>
            <IconButton onClick={() => handleDelete(item._id)} size="small">
              <DeleteIcon fontSize="small" />
            </IconButton>
          </Box>

          <Typography variant="subtitle1">{item.produit}</Typography>
          {item.magasin && (
            <Typography variant="body2" color="text.secondary">
              {item.magasin}
            </Typography>
          )}
          {item.lien && (
            <Typography variant="body2" component="span">
              <a href={item.lien} target="_blank" rel="noopener noreferrer">
                Lien
              </a>
            </Typography>
          )}
          {item.prix && (
            <Typography variant="body2" fontWeight="bold">
              {item.prix}
            </Typography>
          )}
        </ListItem>
      ))}

      {items.length === 0 && (
        <ListItem>
          <ListItemText primary="Aucun article" />
        </ListItem>
      )}
    </List>
  );

  const renderTable = () => (
    <TableContainer component={Paper}>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Date</TableCell>
            <TableCell>Magasin</TableCell>
            <TableCell>Produit</TableCell>
            <TableCell>Lien</TableCell>
            <TableCell>Prix</TableCell>
            <TableCell align="right">Actions</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {items.map(item => (
            <TableRow key={item._id}>
              <TableCell>{dayjs(item.date).format('DD/MM/YYYY')}</TableCell>
              <TableCell>{item.magasin}</TableCell>
              <TableCell>{item.produit}</TableCell>
              <TableCell>
                {item.lien && (
                  <a href={item.lien} target="_blank" rel="noopener noreferrer">
                    Lien
                  </a>
                )}
              </TableCell>
              <TableCell>{item.prix}</TableCell>
              <TableCell align="right">
                <IconButton onClick={() => handleDelete(item._id)}>
                  <DeleteIcon />
                </IconButton>
              </TableCell>
            </TableRow>
          ))}

          {items.length === 0 && (
            <TableRow>
              <TableCell colSpan={6} align="center">
                Aucun article
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </TableContainer>
  );

  /* ------------------ JSX ------------------ */
  return (
    <Layout>
      {/* ---------- En-tête + bouton ---------- */}
      <Box
        mb={4}
        display="flex"
        justifyContent="space-between"
        alignItems="center"
      >
        <div>
          <Typography variant="h4" gutterBottom>
            Liste de courses
          </Typography>
          <Typography variant="subtitle1" color="text.secondary">
            Ajoutez vos achats à venir
          </Typography>
        </div>

        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => setDialogOpen(true)}
        >
          Ajouter
        </Button>
      </Box>

      {/* ---------- Liste ou tableau ---------- */}
      {isMobile ? renderMobileList() : renderTable()}

      {/* ---------- Dialogue « Nouvel article » ---------- */}
      <Dialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle>Nouvel article</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Magasin"
            fullWidth
            value={newItem.magasin}
            onChange={e => setNewItem({ ...newItem, magasin: e.target.value })}
          />
          <TextField
            margin="dense"
            label="Produit"
            fullWidth
            value={newItem.produit}
            onChange={e => setNewItem({ ...newItem, produit: e.target.value })}
          />
          <TextField
            margin="dense"
            label="Lien"
            fullWidth
            value={newItem.lien}
            onChange={e => setNewItem({ ...newItem, lien: e.target.value })}
          />
          <TextField
            margin="dense"
            label="Prix"
            fullWidth
            value={newItem.prix}
            onChange={e => setNewItem({ ...newItem, prix: e.target.value })}
          />
          <TextField
            margin="dense"
            type="date"
            label="Date"
            InputLabelProps={{ shrink: true }}
            fullWidth
            value={newItem.date}
            onChange={e => setNewItem({ ...newItem, date: e.target.value })}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>Annuler</Button>
          <Button variant="contained" onClick={handleAdd}>
            Ajouter
          </Button>
        </DialogActions>
      </Dialog>
    </Layout>
  );
}
