import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { AuthController } from './interfaces/controllers/AuthController';
import { ClientController } from './interfaces/controllers/ClientController';
import { CaseController } from './interfaces/controllers/CaseController';
import { ActionController } from './interfaces/controllers/ActionController';
import { ExpenseController } from './interfaces/controllers/ExpenseController';
import { DeadlineController } from './interfaces/controllers/DeadlineController';
import { UserController } from './interfaces/controllers/UserController';
import { DocumentController } from './interfaces/controllers/DocumentController';
import { CatalogController } from './interfaces/controllers/CatalogController';
import { authenticate } from './interfaces/middlewares/authMiddleware';
import { uploadMiddleware } from './interfaces/middlewares/uploadMiddleware';

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Servir la carpeta de uploads de manera estática
app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));

app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', message: 'API is running' });
});

app.post('/api/auth/login', AuthController.login);
app.get('/api/users', authenticate, UserController.getAll);

// Catálogos
app.get('/api/catalogs/specialties', authenticate, CatalogController.getSpecialties);
app.get('/api/catalogs/entities', authenticate, CatalogController.getEntities);

// Clientes
app.get('/api/clients', authenticate, ClientController.getAll);
app.post('/api/clients', authenticate, uploadMiddleware.single('dniPhoto'), ClientController.create);
app.get('/api/clients/:id', authenticate, ClientController.getById);
app.put('/api/clients/:id', authenticate, uploadMiddleware.single('dniPhoto'), ClientController.update);
app.delete('/api/clients/:id', authenticate, ClientController.delete);

// Casos
app.get('/api/cases', authenticate, CaseController.getAll);
app.post('/api/cases', authenticate, CaseController.create);
app.get('/api/cases/:id', authenticate, CaseController.getById);
app.put('/api/cases/:id', authenticate, CaseController.update);
app.delete('/api/cases/:id', authenticate, CaseController.delete);

// Actuaciones (Actions)
app.get('/api/cases/:caseId/actions', authenticate, ActionController.getByCaseId);
app.post('/api/cases/:caseId/actions', authenticate, uploadMiddleware.single('file'), ActionController.create);
app.delete('/api/actions/:id', authenticate, ActionController.delete);

// Gastos (Expenses)
app.get('/api/cases/:caseId/expenses', authenticate, ExpenseController.getByCaseId);
app.post('/api/cases/:caseId/expenses', authenticate, ExpenseController.create);
app.put('/api/expenses/:id/status', authenticate, ExpenseController.updateStatus);
app.delete('/api/expenses/:id', authenticate, ExpenseController.delete);

// Documentos
app.get('/api/cases/:caseId/documents', authenticate, DocumentController.getByCaseId);
app.post('/api/cases/:caseId/documents', authenticate, uploadMiddleware.single('file'), DocumentController.createForCase);

// Plazos (Deadlines)
app.get('/api/deadlines', authenticate, DeadlineController.getAll);
app.get('/api/cases/:caseId/deadlines', authenticate, DeadlineController.getByCaseId);
app.post('/api/cases/:caseId/deadlines', authenticate, DeadlineController.create);
app.delete('/api/deadlines/:id', authenticate, DeadlineController.delete);

app.listen(port, () => {
  console.log(`[server]: Server is running at http://localhost:${port}`);
});
