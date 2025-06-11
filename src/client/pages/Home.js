import React, { useState, useEffect, useCallback, useRef } from 'react';
import { 
  Box, Typography, Button, Container, Grid, Card, CardContent, 
  Chip, IconButton, useTheme, useMediaQuery, styled, alpha
} from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { LazyLoadImage } from 'react-lazy-load-image-component';
import 'react-lazy-load-image-component/src/effects/blur.css';
import { 
  ArrowForward, PlayArrow, Star, TrendingUp, Flash, 
  ShoppingCart, Favorite, Rocket, Bolt, EmojiEvents, AutoAwesome,
  LocalOffer, Visibility, Speed, Whatshot, TrendingUpSharp
} from '@mui/icons-material';

// Styled Components avec animations avancées
const HeroContainer = styled(Box)(({ theme }) => ({
  position: 'relative',
  minHeight: '100vh',
  background: theme.palette.mode === 'dark' 
    ? 'linear-gradient(135deg, #0f0a1e 0%, #1a0d2e 25%, #2d1b69 50%, #1e1b4b 75%, #0f172a 100%)'
    : 'linear-gradient(135deg, #667eea 0%, #764ba2 25%, #f093fb 50%, #f5576c 75%, #4facfe 100%)',
  overflow: 'hidden',
  display: 'flex',
  alignItems: 'center',
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'radial-gradient(circle at 20% 80%, rgba(120, 119, 198, 0.3) 0%, transparent 50%), radial-gradient(circle at 80% 20%, rgba(255, 119, 198, 0.3) 0%, transparent 50%), radial-gradient(circle at 40% 40%, rgba(120, 200, 255, 0.2) 0%, transparent 50%)',
    animation: 'gradientShift 8s ease-in-out infinite',
    '@keyframes gradientShift': {
      '0%, 100%': { transform: 'translate(0, 0) scale(1)' },
      '33%': { transform: 'translate(30px, -30px) scale(1.1)' },
      '66%': { transform: 'translate(-20px, 20px) scale(0.9)' }
    }
  },
  '&::after': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'url("data:image/svg+xml,%3Csvg width="60" height="60" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg"%3E%3Cg fill="none" fill-rule="evenodd"%3E%3Cg fill="%23ffffff" fill-opacity="0.05"%3E%3Ccircle cx="30" cy="30" r="2"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")',
    opacity: 0.3
  }
}));

const FloatingElements = styled(Box)({
  position: 'absolute',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  pointerEvents: 'none',
  '& .floating-shape': {
    position: 'absolute',
    borderRadius: '50%',
    animation: 'float 8s ease-in-out infinite',
    filter: 'blur(1px)',
    '&:nth-of-type(1)': {
      top: '15%',
      left: '10%',
      width: '120px',
      height: '120px',
      background: 'linear-gradient(45deg, #ff6b6b, #feca57)',
      animationDelay: '0s',
      animationDuration: '8s'
    },
    '&:nth-of-type(2)': {
      top: '60%',
      right: '15%',
      width: '80px',
      height: '80px',
      background: 'linear-gradient(45deg, #48cae4, #023e8a)',
      animationDelay: '2s',
      animationDuration: '10s'
    },
    '&:nth-of-type(3)': {
      bottom: '25%',
      left: '20%',
      width: '100px',
      height: '100px',
      background: 'linear-gradient(45deg, #06ffa5, #00d4aa)',
      animationDelay: '4s',
      animationDuration: '12s'
    },
    '&:nth-of-type(4)': {
      top: '30%',
      right: '35%',
      width: '60px',
      height: '60px',
      background: 'linear-gradient(45deg, #a8edea, #fed6e3)',
      animationDelay: '6s',
      animationDuration: '9s'
    }
  },
  '@keyframes float': {
    '0%, 100%': { 
      transform: 'translateY(0px) translateX(0px) rotate(0deg) scale(1)',
      opacity: 0.7
    },
    '25%': { 
      transform: 'translateY(-30px) translateX(15px) rotate(90deg) scale(1.1)',
      opacity: 0.9
    },
    '50%': { 
      transform: 'translateY(-60px) translateX(-10px) rotate(180deg) scale(0.9)',
      opacity: 0.8
    },
    '75%': { 
      transform: 'translateY(-30px) translateX(-20px) rotate(270deg) scale(1.05)',
      opacity: 0.6
    }
  }
});

const GradientText = styled(Typography)(({ theme }) => ({
  background: 'linear-gradient(45deg, #ff6b6b, #feca57, #48cae4, #06ffa5)',
  backgroundSize: '300% 300%',
  WebkitBackgroundClip: 'text',
  WebkitTextFillColor: 'transparent',
  backgroundClip: 'text',
  animation: 'gradientText 4s ease infinite',
  fontWeight: 900,
  lineHeight: 1.1,
  position: 'relative',
  '&::after': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'inherit',
    filter: 'blur(8px)',
    opacity: 0.3,
    zIndex: -1
  },
  '@keyframes gradientText': {
    '0%': { backgroundPosition: '0% 50%' },
    '50%': { backgroundPosition: '100% 50%' },
    '100%': { backgroundPosition: '0% 50%' }
  }
}));

const GlassmorphismCard = styled(Card)(({ theme }) => ({
  background: theme.palette.mode === 'dark'
    ? 'rgba(255, 255, 255, 0.05)'
    : 'rgba(255, 255, 255, 0.15)',
  backdropFilter: 'blur(20px)',
  border: '1px solid rgba(255, 255, 255, 0.2)',
  borderRadius: '24px',
  transition: 'all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
  cursor: 'pointer',
  position: 'relative',
  overflow: 'hidden',
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: '-100%',
    width: '100%',
    height: '100%',
    background: 'linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent)',
    transition: 'left 0.5s ease'
  },
  '&:hover': {
    transform: 'translateY(-12px) scale(1.02)',
    boxShadow: '0 25px 50px rgba(0, 0, 0, 0.15)',
    '&::before': {
      left: '100%'
    },
    '& .feature-icon': {
      transform: 'scale(1.2) rotate(10deg)',
      filter: 'brightness(1.2)'
    }
  }
}));

const NeuomorphismButton = styled(Button)(({ theme }) => ({
  background: theme.palette.mode === 'dark'
    ? 'linear-gradient(145deg, #2d3748, #1a202c)'
    : 'linear-gradient(145deg, #ffffff, #e2e8f0)',
  border: 'none',
  borderRadius: '20px',
  padding: '16px 32px',
  fontSize: '1.1rem',
  fontWeight: 700,
  textTransform: 'none',
  color: theme.palette.mode === 'dark' ? '#fff' : '#2d3748',
  boxShadow: theme.palette.mode === 'dark'
    ? '8px 8px 16px #1a1f2e, -8px -8px 16px #3d4862'
    : '8px 8px 16px #d1d9e6, -8px -8px 16px #ffffff',
  transition: 'all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
  position: 'relative',
  overflow: 'hidden',
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: '-100%',
    width: '100%',
    height: '100%',
    background: 'linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.3), transparent)',
    transition: 'left 0.5s ease'
  },
  '&:hover': {
    transform: 'translateY(-4px)',
    boxShadow: theme.palette.mode === 'dark'
      ? '12px 12px 24px #1a1f2e, -12px -12px 24px #3d4862'
      : '12px 12px 24px #d1d9e6, -12px -12px 24px #ffffff',
    '&::before': {
      left: '100%'
    }
  },
  '&:active': {
    transform: 'translateY(-2px)',
    boxShadow: theme.palette.mode === 'dark'
      ? '4px 4px 8px #1a1f2e, -4px -4px 8px #3d4862'
      : '4px 4px 8px #d1d9e6, -4px -4px 8px #ffffff'
  }
}));

const PremiumButton = styled(Button)(({ theme }) => ({
  background: 'linear-gradient(45deg, #667eea 0%, #764ba2 50%, #f093fb 100%)',
  border: 'none',
  borderRadius: '50px',
  padding: '18px 36px',
  fontSize: '1.2rem',
  fontWeight: 700,
  textTransform: 'none',
  color: 'white',
  boxShadow: '0 10px 30px rgba(102, 126, 234, 0.4)',
  transition: 'all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
  position: 'relative',
  overflow: 'hidden',
  '&::before': {
    content: '""',
    position: 'absolute',
    top: '-50%',
    left: '-50%',
    width: '200%',
    height: '200%',
    background: 'linear-gradient(45deg, transparent, rgba(255, 255, 255, 0.1), transparent)',
    transform: 'rotate(45deg)',
    transition: 'all 0.6s ease'
  },
  '&:hover': {
    transform: 'translateY(-6px) scale(1.05)',
    boxShadow: '0 20px 40px rgba(102, 126, 234, 0.6)',
    '&::before': {
      left: '50%',
      top: '50%'
    }
  }
}));

const StatsChip = styled(Chip)(({ theme }) => ({
  background: 'linear-gradient(45deg, #ff6b6b, #feca57)',
  color: 'white',
  fontWeight: 700,
  padding: '12px 8px',
  fontSize: '0.9rem',
  borderRadius: '20px',
  boxShadow: '0 8px 25px rgba(255, 107, 107, 0.3)',
  animation: 'pulse 3s ease-in-out infinite',
  '& .MuiChip-icon': {
    color: 'white',
    fontSize: '1.2rem'
  },
  '@keyframes pulse': {
    '0%, 100%': { transform: 'scale(1)', boxShadow: '0 8px 25px rgba(255, 107, 107, 0.3)' },
    '50%': { transform: 'scale(1.05)', boxShadow: '0 12px 35px rgba(255, 107, 107, 0.5)' }
  }
}));

const InteractiveBackground = ({ mousePosition }) => {
  const cursorStyle = {
    position: 'absolute',
    width: '300px',
    height: '300px',
    background: 'radial-gradient(circle, rgba(255, 255, 255, 0.1) 0%, transparent 70%)',
    borderRadius: '50%',
    pointerEvents: 'none',
    transform: `translate(${mousePosition.x - 150}px, ${mousePosition.y - 150}px)`,
    transition: 'transform 0.1s ease-out',
    zIndex: 1
  };

  return <Box sx={cursorStyle} />;
};

// Hook pour suivre la souris
const useMousePosition = () => {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const updateMousePosition = (e) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };

    window.addEventListener('mousemove', updateMousePosition);
    return () => window.removeEventListener('mousemove', updateMousePosition);
  }, []);

  return mousePosition;
};

// Données du hero banner
const heroData = {
  badge: "🚀 Innovation 2025 - Nouvelle Génération",
  title: "Révolutionnez votre",
  highlight: "E-commerce",
  subtitle: "avec l'Intelligence Artificielle",
  description: "Découvrez une plateforme e-commerce révolutionnaire propulsée par l'IA, offrant des performances exceptionnelles, une expérience utilisateur immersive et des résultats mesurables.",
  stats: [
    { icon: Star, label: "Satisfaction Client", value: "99.8%", color: "#ff6b6b" },
    { icon: TrendingUp, label: "Croissance Ventes", value: "+285%", color: "#48cae4" },
    { icon: Speed, label: "Performance", value: "0.2s", color: "#06ffa5" },
    { icon: EmojiEvents, label: "Clients Premium", value: "10K+", color: "#feca57" }
  ],
  features: [
    {
      icon: AutoAwesome,
      title: "IA Prédictive",
      description: "Algorithmes avancés qui anticipent les besoins de vos clients et optimisent automatiquement vos ventes.",
      gradient: "linear-gradient(45deg, #667eea, #764ba2)"
    },
    {
      icon: Whatshot,
      title: "Interface Premium",
      description: "Design ultra-moderne avec animations fluides et expérience utilisateur exceptionnelle certifiée.",
      gradient: "linear-gradient(45deg, #f093fb, #f5576c)"
    },
    {
      icon: Bolt,
      title: "Performance Extrême",
      description: "Chargement instantané, optimisations avancées et infrastructure cloud de nouvelle génération.",
      gradient: "linear-gradient(45deg, #4facfe, #00f2fe)"
    }
  ]
};

function ExceptionalHeroBanner() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const isTablet = useMediaQuery(theme.breakpoints.down('lg'));
  const mousePosition = useMousePosition();
  const [currentFeature, setCurrentFeature] = useState(0);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
    const interval = setInterval(() => {
      setCurrentFeature((prev) => (prev + 1) % heroData.features.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        duration: 1,
        when: "beforeChildren",
        staggerChildren: 0.15
      }
    }
  };

  const itemVariants = {
    hidden: { y: 60, opacity: 0, scale: 0.9 },
    visible: {
      y: 0,
      opacity: 1,
      scale: 1,
      transition: { 
        duration: 0.8, 
        ease: [0.175, 0.885, 0.32, 1.275]
      }
    }
  };

  const statsVariants = {
    hidden: { scale: 0, rotate: -180 },
    visible: {
      scale: 1,
      rotate: 0,
      transition: { 
        duration: 0.6,
        ease: "easeOut"
      }
    }
  };

  return (
    <HeroContainer>
      {/* Background interactif */}
      <InteractiveBackground mousePosition={mousePosition} />
      
      {/* Éléments flottants */}
      <FloatingElements>
        <div className="floating-shape" />
        <div className="floating-shape" />
        <div className="floating-shape" />
        <div className="floating-shape" />
      </FloatingElements>

      <Container maxWidth="xl" sx={{ position: 'relative', zIndex: 3 }}>
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate={isVisible ? "visible" : "hidden"}
        >
          <Grid container spacing={6} alignItems="center">
            {/* Contenu principal */}
            <Grid item xs={12} lg={7}>
              <motion.div variants={itemVariants}>
                <StatsChip
                  icon={<Rocket />}
                  label={heroData.badge}
                  sx={{ mb: 4, fontSize: isMobile ? '0.8rem' : '0.9rem' }}
                />
              </motion.div>

              <motion.div variants={itemVariants}>
                <Typography
                  variant={isMobile ? "h2" : "h1"}
                  sx={{
                    mb: 2,
                    fontWeight: 900,
                    fontSize: isMobile ? '2.5rem' : '4rem',
                    color: 'white',
                    textShadow: '0 4px 20px rgba(0,0,0,0.3)'
                  }}
                >
                  {heroData.title}{' '}
                  <GradientText
                    component="span"
                    variant={isMobile ? "h2" : "h1"}
                    sx={{ fontSize: 'inherit' }}
                  >
                    {heroData.highlight}
                  </GradientText>
                </Typography>
              </motion.div>

              <motion.div variants={itemVariants}>
                <Typography
                  variant={isMobile ? "h5" : "h3"}
                  sx={{
                    mb: 3,
                    color: 'rgba(255, 255, 255, 0.9)',
                    fontWeight: 500,
                    textShadow: '0 2px 10px rgba(0,0,0,0.2)'
                  }}
                >
                  {heroData.subtitle}
                </Typography>
              </motion.div>

              <motion.div variants={itemVariants}>
                <Typography
                  variant="h6"
                  sx={{
                    mb: 4,
                    color: 'rgba(255, 255, 255, 0.8)',
                    fontSize: isMobile ? '1rem' : '1.3rem',
                    lineHeight: 1.6,
                    maxWidth: '90%',
                    textShadow: '0 2px 8px rgba(0,0,0,0.2)'
                  }}
                >
                  {heroData.description}
                </Typography>
              </motion.div>

              {/* Statistiques */}
              <motion.div variants={itemVariants}>
                <Grid container spacing={2} sx={{ mb: 5 }}>
                  {heroData.stats.map((stat, index) => {
                    const IconComponent = stat.icon;
                    return (
                      <Grid item xs={6} md={3} key={index}>
                        <motion.div variants={statsVariants}>
                          <Box
                            sx={{
                              textAlign: 'center',
                              p: 3,
                              borderRadius: 3,
                              background: `linear-gradient(135deg, ${stat.color}20, ${stat.color}10)`,
                              backdropFilter: 'blur(10px)',
                              border: `1px solid ${stat.color}40`,
                              transition: 'all 0.3s ease',
                              cursor: 'pointer',
                              '&:hover': {
                                transform: 'translateY(-5px) scale(1.05)',
                                background: `linear-gradient(135deg, ${stat.color}30, ${stat.color}15)`,
                                boxShadow: `0 15px 35px ${stat.color}30`
                              }
                            }}
                          >
                            <IconComponent
                              sx={{
                                fontSize: 32,
                                color: stat.color,
                                mb: 1,
                                filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.3))'
                              }}
                            />
                            <Typography
                              variant="h5"
                              sx={{ 
                                fontWeight: 900, 
                                mb: 0.5, 
                                color: 'white',
                                textShadow: '0 2px 4px rgba(0,0,0,0.3)'
                              }}
                            >
                              {stat.value}
                            </Typography>
                            <Typography
                              variant="caption"
                              sx={{ 
                                color: 'rgba(255, 255, 255, 0.8)',
                                fontWeight: 600,
                                fontSize: '0.8rem'
                              }}
                            >
                              {stat.label}
                            </Typography>
                          </Box>
                        </motion.div>
                      </Grid>
                    );
                  })}
                </Grid>
              </motion.div>

              {/* Boutons CTA */}
              <motion.div variants={itemVariants}>
                <Box sx={{ display: 'flex', gap: 3, flexWrap: 'wrap' }}>
                  <PremiumButton
                    size="large"
                    endIcon={<ArrowForward />}
                    component={RouterLink}
                    to="/categories"
                  >
                    Commencer l'Expérience
                  </PremiumButton>
                  
                  <NeuomorphismButton
                    size="large"
                    startIcon={<Visibility />}
                    component={RouterLink}
                    to="/products"
                  >
                    Explorer le Catalogue
                  </NeuomorphismButton>
                </Box>
              </motion.div>
            </Grid>

            {/* Section des fonctionnalités */}
            <Grid item xs={12} lg={5}>
              <motion.div variants={itemVariants}>
                <Box sx={{ position: 'relative', height: '100%' }}>
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={currentFeature}
                      initial={{ opacity: 0, x: 100, rotateY: 90 }}
                      animate={{ opacity: 1, x: 0, rotateY: 0 }}
                      exit={{ opacity: 0, x: -100, rotateY: -90 }}
                      transition={{ 
                        duration: 0.6,
                        ease: [0.175, 0.885, 0.32, 1.275]
                      }}
                    >
                      <GlassmorphismCard
                        sx={{
                          mb: 3,
                          minHeight: '300px',
                          background: heroData.features[currentFeature].gradient + ', rgba(255, 255, 255, 0.1)'
                        }}
                      >
                        <CardContent sx={{ p: 4, height: '100%', display: 'flex', flexDirection: 'column' }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                            {React.createElement(heroData.features[currentFeature].icon, {
                              className: 'feature-icon',
                              sx: {
                                fontSize: 56,
                                color: 'white',
                                mr: 3,
                                transition: 'all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
                                filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.3))'
                              }
                            })}
                            <Typography 
                              variant="h4" 
                              sx={{ 
                                fontWeight: 800, 
                                color: 'white',
                                textShadow: '0 2px 8px rgba(0,0,0,0.3)'
                              }}
                            >
                              {heroData.features[currentFeature].title}
                            </Typography>
                          </Box>
                          <Typography
                            variant="h6"
                            sx={{ 
                              color: 'rgba(255, 255, 255, 0.9)',
                              fontSize: '1.2rem',
                              lineHeight: 1.6,
                              flexGrow: 1,
                              textShadow: '0 1px 4px rgba(0,0,0,0.2)'
                            }}
                          >
                            {heroData.features[currentFeature].description}
                          </Typography>
                        </CardContent>
                      </GlassmorphismCard>
                    </motion.div>
                  </AnimatePresence>

                  {/* Indicateurs de fonctionnalités */}
                  <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2 }}>
                    {heroData.features.map((_, index) => (
                      <Box
                        key={index}
                        sx={{
                          width: 12,
                          height: 12,
                          borderRadius: '50%',
                          background: index === currentFeature
                            ? 'linear-gradient(45deg, #fff, #f0f0f0)'
                            : 'rgba(255, 255, 255, 0.3)',
                          cursor: 'pointer',
                          transition: 'all 0.3s ease',
                          transform: index === currentFeature ? 'scale(1.3)' : 'scale(1)',
                          boxShadow: index === currentFeature 
                            ? '0 4px 15px rgba(255, 255, 255, 0.4)' 
                            : 'none'
                        }}
                        onClick={() => setCurrentFeature(index)}
                      />
                    ))}
                  </Box>
                </Box>
              </motion.div>
            </Grid>
          </Grid>
        </motion.div>
      </Container>

      {/* Indicateur de scroll */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 2, duration: 1 }}
      >
        <Box
          sx={{
            position: 'absolute',
            bottom: 30,
            left: '50%',
            transform: 'translateX(-50%)',
            color: 'rgba(255, 255, 255, 0.7)',
            textAlign: 'center',
            animation: 'bounce 2s infinite',
            '@keyframes bounce': {
              '0%, 20%, 50%, 80%, 100%': { transform: 'translateY(0) translateX(-50%)' },
              '40%': { transform: 'translateY(-10px) translateX(-50%)' },
              '60%': { transform: 'translateY(-5px) translateX(-50%)' }
            }
          }}
        >
          <Typography variant="body2" sx={{ mb: 1, fontWeight: 600 }}>
            Découvrir plus
          </Typography>
          <Box
            sx={{
              width: 2,
              height: 30,
              background: 'linear-gradient(to bottom, rgba(255,255,255,0.8), transparent)',
              margin: '0 auto',
              borderRadius: 1
            }}
          />
        </Box>
      </motion.div>

      {/* Dégradé de transition */}
      <Box
        sx={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          height: '120px',
          background: `linear-gradient(transparent, ${theme.palette.background.default})`,
          pointerEvents: 'none'
        }}
      />
    </HeroContainer>
  );
}

export default ExceptionalHeroBanner;