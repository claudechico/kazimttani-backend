const express = require('express');
const router = express.Router();

const servicesOperation = require('../Model/Services');

// GET all services
router.get('/all-services', async (req, res) => {
  try {
    const services = await servicesOperation.getAllServices();
    res.json({
      success: true,
      services: services
    });
  } catch (error) {
    res.status(500).json({ 
      success: false,
      message: 'Error fetching services', 
      error: error.message 
    });
  }
});

// GET service by ID
router.get('/single-service/:service_id', async (req, res) => {
  try {
    const service = await servicesOperation.getServiceById(req.params.service_id);
    if (!service) {
      return res.status(404).json({ message: 'Service not found' });
    }
    res.json({
      success: true,
      service: service
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching service', error: error.message });
  }
});

// GET services by provider ID
router.get('/provider-services/:provider_id', async (req, res) => {
  try {
    console.log('Fetching services for provider ID:', req.params.provider_id);
    const services = await servicesOperation.servicesByProvider(req.params.provider_id);
    console.log('Retrieved services:', services);
    if (!services || services.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'No services found for this provider'
      });
    }

    res.json({
      success: true,
      count: services.length,
      services: services
    });
  } catch (error) {
    console.error('Provider services error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Error fetching provider services', 
      error: error.message 
    });
  }
});

// POST create new service
router.post('/create-service', async (req, res) => {
  try {
    const { 
      provider_id, 
      service_name, 
      description, 
      price, 
      category_id, 
      location, 
      
    } = req.body;
    const images = req.body.images || [];

    // Basic validation
    if (!service_name || !provider_id) {
      return res.status(400).json({ message: 'Service name and provider ID are required' });
    }

    const serviceData = {
      provider_id,
      service_name,
      description,
      price,
      category_id,
      location,
    
    };

    const result = await servicesOperation.createServices(serviceData, images);
    
    res.status(201).json({ 
      success: true,
      message: 'Service created successfully',
      serviceId: result.insertId
    });
  } catch (error) {
    res.status(500).json({ message: 'Error creating service', error: error.message });
  }
});
// PUT update service
router.put('/update-service/:serviceId', async (req, res) => {
  try {
    const serviceId = req.params.serviceId;
    const { 
      provider_id, 
      service_name, 
      description, 
      price, 
      category_id, 
      location, 
      availability 
    } = req.body;
    const images = req.body.images || [];

    // Check if service exists
    const existingService = await servicesOperation.getServiceById(serviceId);
    if (!existingService) {
      return res.status(404).json({ message: 'Service not found' });
    }

    // Basic validation
    if (!service_name || !provider_id) {
      return res.status(400).json({ message: 'Service name and provider ID are required' });
    }
    const serviceData = {
      provider_id,
      service_name,
      description,
      price,
      category_id,
      location,
      availability
    };

    await servicesOperation.updateService(serviceId, serviceData, images);
    res.json({ 
      success: true,
      message: 'Service updated successfully' 
    });
  } catch (error) {
    res.status(500).json({ message: 'Error updating service', error: error.message });
  }
});

// DELETE service
router.delete('/delete-service/:serviceId', async (req, res) => {
  try {
    const serviceId = req.params.serviceId;
    
    // Check if service exists
    const existingService = await servicesOperation.getServiceById(serviceId);
    if (!existingService) {
      return res.status(404).json({ message: 'Service not found' });
    }

    await servicesOperation.deleteService(serviceId);
    res.json({ 
      success: true,
      message: 'Service deleted successfully' 
    });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting service', error: error.message });
  }
});

module.exports = router;