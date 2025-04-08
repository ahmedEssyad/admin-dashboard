import React, { useState } from 'react';
import { 
  Container, Box, Typography, TextField, Button, 
  Paper, Avatar, Alert 
} from '@mui/material';
import { LockOutlined } from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../shared/contexts/AuthContext';
import { useFormik } from 'formik';
import * as Yup from 'yup';

const validationSchema = Yup.object({
  username: Yup.string()
    .required('Le nom d\'utilisateur est requis'),
  password: Yup.string()
    .required('Le mot de passe est requis')
});

function Login() {
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || '/admin/dashboard';

  const formik = useFormik({
    initialValues: {
      username: '',
      password: ''
    },
    validationSchema: validationSchema,
    onSubmit: async (values) => {
      try {
        const success = await login(values.username, values.password);
        if (success) {
          navigate(from, { replace: true });
        } else {
          setError('Nom d\'utilisateur ou mot de passe incorrect.');
        }
      } catch (err) {
        setError('Une erreur est survenue lors de la connexion.');
      }
    }
  });

  return (
    <Container component="main" maxWidth="xs">
      <Box
        sx={{
          marginTop: 8,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        <Paper elevation={3} sx={{ padding: 4, width: '100%' }}>
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <Avatar sx={{ m: 1, bgcolor: 'primary.main' }}>
              <LockOutlined />
            </Avatar>
            <Typography component="h1" variant="h5">
              Connexion Admin
            </Typography>
            {error && (
              <Alert severity="error" sx={{ mt: 2, width: '100%' }}>
                {error}
              </Alert>
            )}
            <Box component="form" onSubmit={formik.handleSubmit} sx={{ mt: 1, width: '100%' }}>
              <TextField
                margin="normal"
                required
                fullWidth
                id="username"
                label="Nom d'utilisateur"
                name="username"
                autoComplete="username"
                autoFocus
                value={formik.values.username}
                onChange={formik.handleChange}
                error={formik.touched.username && Boolean(formik.errors.username)}
                helperText={formik.touched.username && formik.errors.username}
              />
              <TextField
                margin="normal"
                required
                fullWidth
                name="password"
                label="Mot de passe"
                type="password"
                id="password"
                autoComplete="current-password"
                value={formik.values.password}
                onChange={formik.handleChange}
                error={formik.touched.password && Boolean(formik.errors.password)}
                helperText={formik.touched.password && formik.errors.password}
              />
              <Button
                type="submit"
                fullWidth
                variant="contained"
                sx={{ mt: 3, mb: 2 }}
                disabled={formik.isSubmitting}
              >
                Se connecter
              </Button>
            </Box>
          </Box>
        </Paper>
      </Box>
    </Container>
  );
}

export default Login;