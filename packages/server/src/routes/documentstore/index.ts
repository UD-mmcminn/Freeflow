import express from 'express'
import { checkWorkspacePermission, checkAnyWorkspacePermission } from '../../iam/rbac/PermissionCheck'
import documentStoreController from '../../controllers/documentstore'
import { getMulterStorage } from '../../utils'

const router = express.Router()

router.post(['/upsert/', '/upsert/:id'], getMulterStorage().array('files'), documentStoreController.upsertDocStoreMiddleware)

router.post(['/refresh/', '/refresh/:id'], documentStoreController.refreshDocStoreMiddleware)

/** Document Store Routes */
// Create document store
router.post('/store', checkWorkspacePermission('documentStores:create'), documentStoreController.createDocumentStore)
// List all stores
router.get('/store', checkWorkspacePermission('documentStores:view'), documentStoreController.getAllDocumentStores)
// Get specific store
router.get(
    '/store/:id',
    checkAnyWorkspacePermission('documentStores:view,documentStores:update,documentStores:delete'),
    documentStoreController.getDocumentStoreById
)
// Update documentStore
router.put('/store/:id', checkAnyWorkspacePermission('documentStores:create,documentStores:update'), documentStoreController.updateDocumentStore)
// Delete documentStore
router.delete('/store/:id', checkWorkspacePermission('documentStores:delete'), documentStoreController.deleteDocumentStore)
// Get document store configs
router.get('/store-configs/:id/:loaderId', checkAnyWorkspacePermission('documentStores:view'), documentStoreController.getDocStoreConfigs)

/** Component Nodes = Document Store - Loaders */
// Get all loaders
router.get('/components/loaders', checkWorkspacePermission('documentStores:add-loader'), documentStoreController.getDocumentLoaders)

// delete loader from document store
router.delete(
    '/loader/:id/:loaderId',
    checkWorkspacePermission('documentStores:delete-loader'),
    documentStoreController.deleteLoaderFromDocumentStore
)
// chunking preview
router.post('/loader/preview', checkWorkspacePermission('documentStores:preview-process'), documentStoreController.previewFileChunks)
// saving process
router.post('/loader/save', checkWorkspacePermission('documentStores:preview-process'), documentStoreController.saveProcessingLoader)
// chunking process
router.post('/loader/process/:loaderId', checkWorkspacePermission('documentStores:preview-process'), documentStoreController.processLoader)

/** Document Store - Loaders - Chunks */
// delete specific file chunk from the store
router.delete(
    '/chunks/:storeId/:loaderId/:chunkId',
    checkAnyWorkspacePermission('documentStores:update,documentStores:delete'),
    documentStoreController.deleteDocumentStoreFileChunk
)
// edit specific file chunk from the store
router.put(
    '/chunks/:storeId/:loaderId/:chunkId',
    checkWorkspacePermission('documentStores:update'),
    documentStoreController.editDocumentStoreFileChunk
)
// Get all file chunks from the store
router.get('/chunks/:storeId/:fileId/:pageNo', checkWorkspacePermission('documentStores:view'), documentStoreController.getDocumentStoreFileChunks)

// add chunks to the selected vector store
router.post('/vectorstore/insert', checkWorkspacePermission('documentStores:upsert-config'), documentStoreController.insertIntoVectorStore)
// save the selected vector store
router.post('/vectorstore/save', checkWorkspacePermission('documentStores:upsert-config'), documentStoreController.saveVectorStoreConfig)
// delete data from the selected vector store
router.delete('/vectorstore/:storeId', checkWorkspacePermission('documentStores:upsert-config'), documentStoreController.deleteVectorStoreFromStore)
// query the vector store
router.post('/vectorstore/query', checkWorkspacePermission('documentStores:view'), documentStoreController.queryVectorStore)
// Get all embedding providers
router.get('/components/embeddings', checkWorkspacePermission('documentStores:upsert-config'), documentStoreController.getEmbeddingProviders)
// Get all vector store providers
router.get('/components/vectorstore', checkWorkspacePermission('documentStores:upsert-config'), documentStoreController.getVectorStoreProviders)
// Get all Record Manager providers
router.get('/components/recordmanager', checkWorkspacePermission('documentStores:upsert-config'), documentStoreController.getRecordManagerProviders)

// update the selected vector store from the playground
router.post('/vectorstore/update', checkWorkspacePermission('documentStores:upsert-config'), documentStoreController.updateVectorStoreConfigOnly)

// generate docstore tool description
router.post('/generate-tool-desc/:id', documentStoreController.generateDocStoreToolDesc)

export default router
