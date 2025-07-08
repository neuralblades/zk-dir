import { useState, useEffect, useMemo } from 'react';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import hljs from 'highlight.js';
import 'highlight.js/styles/atom-one-dark.css';
import { getDownloadURL, getStorage, ref, uploadBytesResumable } from 'firebase/storage';
import { app } from '../firebase';
import { useNavigate, useParams } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { FiUpload, FiX, FiPlus, FiTrash2 } from 'react-icons/fi';

export default function UpdatePost() {
  useEffect(() => {
    if (typeof window !== 'undefined') {
      window.hljs = hljs;
    }
  }, []);

  const [file, setFile] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(null);
  const [uploadError, setUploadError] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    image: '',
    publishDate: new Date().toISOString().split('T')[0],
    reportSource: {
      name: '',
      url: ''
    },
    auditFirm: '',
    protocol: {
      name: '',
      type: 'OTHER'
    },
    source: '',
    severity: 'N/A',
    difficulty: 'N/A',
    tags: [],
    frameworks: [],
    reported_by: [],
    scope: [{
      name: '',
      repository: '',
      commit_hash: '',
      description: ''
    }],
    finding_id: '',
    target_file: '',
    impact: '',
    recommendation: ''
  });
  const [publishError, setPublishError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentTag, setCurrentTag] = useState('');
  const [currentFramework, setCurrentFramework] = useState('');
  const [currentReporter, setCurrentReporter] = useState('');

  const { postId } = useParams();
  const navigate = useNavigate();
  const { currentUser } = useSelector((state) => state.user);

  // Fetch post data
  useEffect(() => {
    const fetchPost = async () => {
      try {
        const res = await fetch(`/api/post/getposts?postId=${postId}`);
        const data = await res.json();
        
        if (!res.ok) {
          setPublishError(data.message);
          return;
        }
        
        const post = data.posts[0];
        
        // Format the data with proper defaults
        setFormData({
          ...post,
          // Ensure required fields have defaults
          title: post.title || '',
          content: post.content || '',
          image: post.image || '',
          
          // Handle new fields with proper defaults
          publishDate: post.publishDate ? 
            new Date(post.publishDate).toISOString().split('T')[0] : 
            new Date().toISOString().split('T')[0],
          
          reportSource: post.reportSource || {
            name: '',
            url: ''
          },
          
          auditFirm: post.auditFirm || '',
          
          // Handle nested protocol object
          protocol: post.protocol || {
            name: '',
            type: 'OTHER'
          },
          
          // Handle arrays with defaults
          tags: Array.isArray(post.tags) ? post.tags : [],
          frameworks: Array.isArray(post.frameworks) ? post.frameworks : [],
          reported_by: Array.isArray(post.reported_by) ? post.reported_by : [],
          
          // Handle scope array with defaults
          scope: Array.isArray(post.scope) && post.scope.length > 0 ? 
            post.scope : 
            [{
              name: '',
              repository: '',
              commit_hash: '',
              description: ''
            }],
          
          // Other fields with defaults matching schema enums
          severity: post.severity || 'N/A',
          difficulty: post.difficulty || 'N/A',
          finding_id: post.finding_id || '',
          target_file: post.target_file || '',
          impact: post.impact || '',
          recommendation: post.recommendation || ''
        });
        
        setPublishError(null);
      } catch (error) {
        console.error('Error fetching post:', error);
        setPublishError('Error fetching post data');
      }
    };

    if (postId) {
      fetchPost();
    }
  }, [postId]);

  const handleUploadImage = async () => {
    try {
      if (!file) {
        setUploadError('Please select an image');
        return;
      }

      const TWO_MB = 2 * 1024 * 1024;
      if (file.size > TWO_MB) {
        setUploadError('File size should be less than 2MB');
        return;
      }

      if (!file.type.startsWith('image/')) {
        setUploadError('Please upload only image files');
        return;
      }

      setUploadError(null);
      const storage = getStorage(app);
      const fileName = new Date().getTime() + '-' + file.name;
      const storageRef = ref(storage, 'zk-bugs/' + fileName);
      const uploadTask = uploadBytesResumable(storageRef, file);

      uploadTask.on(
        'state_changed',
        (snapshot) => {
          const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          setUploadProgress(progress.toFixed(0));
        },
        (error) => {
          console.error('Upload error:', error);
          setUploadError('Failed to upload image: ' + error.message);
          setUploadProgress(null);
          setFile(null);
        },
        async () => {
          try {
            const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
            setFormData((prev) => ({ ...prev, image: downloadURL }));
            setUploadProgress(null);
            setUploadError(null);
            setFile(null);
          } catch (error) {
            console.error('Error getting download URL:', error);
            setUploadError('Failed to get image URL');
            setUploadProgress(null);
          }
        }
      );
    } catch (error) {
      console.error('Upload handler error:', error);
      setUploadError('An unexpected error occurred');
      setUploadProgress(null);
      setFile(null);
    }
  };

  const handleAddTag = (e) => {
    e.preventDefault();
    if (currentTag && !formData.tags.includes(currentTag)) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, currentTag]
      }));
      setCurrentTag('');
    }
  };

  const handleAddFramework = (e) => {
    e.preventDefault();
    if (currentFramework && !formData.frameworks.includes(currentFramework)) {
      setFormData(prev => ({
        ...prev,
        frameworks: [...prev.frameworks, currentFramework]
      }));
      setCurrentFramework('');
    }
  };

  const handleAddReporter = (e) => {
    e.preventDefault();
    if (currentReporter && !formData.reported_by.includes(currentReporter)) {
      setFormData(prev => ({
        ...prev,
        reported_by: [...prev.reported_by, currentReporter]
      }));
      setCurrentReporter('');
    }
  };

  const handleScopeChange = (index, field, value) => {
    const newScope = [...formData.scope];
    newScope[index] = { ...newScope[index], [field]: value };
    setFormData(prev => ({ ...prev, scope: newScope }));
  };

  const handleAddScope = () => {
    setFormData(prev => ({
      ...prev,
      scope: [...prev.scope, { name: '', repository: '', commit_hash: '', description: '' }]
    }));
  };

  const handleRemoveScope = (index) => {
    setFormData(prev => ({
      ...prev,
      scope: prev.scope.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.title || !formData.content) {
      setPublishError('Title and content are required!');
      return;
    }

    setPublishError(null);
    setIsSubmitting(true);

    const postData = {
      ...formData,
      content: formData.content,
      scope: formData.scope.filter(s => s.name.trim() !== ''),
      tags: formData.tags || [],
      frameworks: formData.frameworks || [],
      reported_by: formData.reported_by || []
    };

    try {
      const res = await fetch(`/api/post/updatepost/${formData._id}/${currentUser._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(postData),
      });

      const data = await res.json();
      
      if (!res.ok) {
        setPublishError(data.message);
        setIsSubmitting(false);
        return;
      }

      navigate(`/post/${data.slug}`);
    } catch (error) {
      console.error('Error updating post:', error);
      setPublishError('Something went wrong while updating the post');
      setIsSubmitting(false);
    }
  };

  const modules = useMemo(() => ({
    syntax: {
      highlight: (text) => hljs.highlightAuto(text).value,
    },
    toolbar: [
      [{ header: [1, 2, false] }],
      ['bold', 'italic', 'underline', 'strike', 'blockquote'],
      [{ list: 'ordered' }, { list: 'bullet' }, { indent: '-1' }, { indent: '+1' }],
      ['link', 'image'],
      ['code-block'],
      ['clean'],
    ],
  }), []);

  const formats = [
    'header', 'font', 'size', 'bold', 'italic', 'underline', 'strike',
    'blockquote', 'list', 'bullet', 'indent', 'link', 'image', 'code-block',
  ];

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="max-w-4xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2">Update ZK Bug Report</h1>
          <p className="text-zinc-400">Edit and update your zero-knowledge proof vulnerability report</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Basic Information */}
          <div className="bg-zinc-900/50 border border-zinc-800/50 rounded-xl p-6">
            <h2 className="text-xl font-semibold mb-4">Basic Information</h2>
            <div className="space-y-4">
              <input
                type="text"
                placeholder="Bug Report Title"
                required
                className="w-full px-4 py-3 bg-zinc-800/50 border border-zinc-700/50 rounded-lg text-white placeholder-zinc-500 focus:outline-none focus:ring-0 focus:border-zinc-500 transition-colors duration-200"
                value={formData.title || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              />
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-zinc-300 mb-2">Publish Date</label>
                  <input
                    type="date"
                    required
                    className="w-full px-4 py-3 bg-zinc-800/50 border border-zinc-700/50 rounded-lg text-white focus:outline-none focus:ring-0 focus:border-zinc-500 transition-colors duration-200"
                    value={formData.publishDate ? new Date(formData.publishDate).toISOString().split('T')[0] : ''}
                    onChange={(e) => setFormData(prev => ({ ...prev, publishDate: e.target.value }))}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-zinc-300 mb-2">Audit Firm</label>
                  <input
                    type="text"
                    placeholder="Audit Firm Name"
                    className="w-full px-4 py-3 bg-zinc-800/50 border border-zinc-700/50 rounded-lg text-white placeholder-zinc-500 focus:outline-none focus:ring-0 focus:border-zinc-500 transition-colors duration-200"
                    value={formData.auditFirm || ''}
                    onChange={(e) => setFormData(prev => ({ ...prev, auditFirm: e.target.value }))}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input
                  type="text"
                  placeholder="Source Name"
                  className="w-full px-4 py-3 bg-zinc-800/50 border border-zinc-700/50 rounded-lg text-white placeholder-zinc-500 focus:outline-none focus:ring-0 focus:border-zinc-500 transition-colors duration-200"
                  value={formData.reportSource?.name || ''}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    reportSource: { ...prev.reportSource, name: e.target.value }
                  }))}
                />
                <input
                  type="url"
                  placeholder="Source URL"
                  className="w-full px-4 py-3 bg-zinc-800/50 border border-zinc-700/50 rounded-lg text-white placeholder-zinc-500 focus:outline-none focus:ring-0 focus:border-zinc-500 transition-colors duration-200"
                  value={formData.reportSource?.url || ''}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    reportSource: { ...prev.reportSource, url: e.target.value }
                  }))}
                />
              </div>
            </div>
          </div>

          {/* Protocol Information */}
          <div className="bg-zinc-900/50 border border-zinc-800/50 rounded-xl p-6">
            <h2 className="text-xl font-semibold mb-4">Protocol Details</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <input
                type="text"
                placeholder="Protocol Name"
                className="w-full px-4 py-3 bg-zinc-800/50 border border-zinc-700/50 rounded-lg text-white placeholder-zinc-500 focus:outline-none focus:ring-0 focus:border-zinc-500 transition-colors duration-200"
                value={formData.protocol?.name || ''}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  protocol: { ...prev.protocol, name: e.target.value }
                }))}
              />
              <select
                className="w-full px-4 py-3 bg-zinc-800/50 border border-zinc-700/50 rounded-lg text-white focus:outline-none focus:ring-0 focus:border-zinc-500 transition-colors duration-200"
                value={formData.protocol?.type || 'OTHER'}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  protocol: { ...prev.protocol, type: e.target.value }
                }))}
              >
                <option value="OTHER">Other</option>
                <option value="ZKEVM">ZKEVM</option>
                <option value="ZKTRIE">ZKTRIE</option>
                <option value="L2GETH">L2GETH</option>
              </select>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <select
                className="w-full px-4 py-3 bg-zinc-800/50 border border-zinc-700/50 rounded-lg text-white focus:outline-none focus:ring-0 focus:border-zinc-500 transition-colors duration-200"
                value={formData.severity || 'N/A'}
                onChange={(e) => setFormData(prev => ({ ...prev, severity: e.target.value }))}
              >
                <option value="N/A">No Severity</option>
                <option value="informational">Informational</option>
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="critical">Critical</option>
              </select>
              <select
                className="w-full px-4 py-3 bg-zinc-800/50 border border-zinc-700/50 rounded-lg text-white focus:outline-none focus:ring-0 focus:border-zinc-500 transition-colors duration-200"
                value={formData.difficulty || 'N/A'}
                onChange={(e) => setFormData(prev => ({ ...prev, difficulty: e.target.value }))}
              >
                <option value="N/A">No Difficulty</option>
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input
                type="text"
                placeholder="Finding ID"
                className="w-full px-4 py-3 bg-zinc-800/50 border border-zinc-700/50 rounded-lg text-white placeholder-zinc-500 focus:outline-none focus:ring-0 focus:border-zinc-500 transition-colors duration-200"
                value={formData.finding_id || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, finding_id: e.target.value }))}
              />
              <input
                type="text"
                placeholder="Target File"
                className="w-full px-4 py-3 bg-zinc-800/50 border border-zinc-700/50 rounded-lg text-white placeholder-zinc-500 focus:outline-none focus:ring-0 focus:border-zinc-500 transition-colors duration-200"
                value={formData.target_file || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, target_file: e.target.value }))}
              />
            </div>
          </div>

          {/* Tags and Classification */}
          <div className="bg-zinc-900/50 border border-zinc-800/50 rounded-xl p-6">
            <h2 className="text-xl font-semibold mb-4">Classification</h2>
            
            {/* Tags */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-zinc-300 mb-2">Tags</label>
              <div className="flex gap-2 mb-2">
                <input
                  type="text"
                  placeholder="Add tag"
                  className="flex-1 px-4 py-2 bg-zinc-800/50 border border-zinc-700/50 rounded-lg text-white placeholder-zinc-500 focus:outline-none focus:ring-0 focus:border-zinc-500 transition-colors duration-200"
                  value={currentTag}
                  onChange={(e) => setCurrentTag(e.target.value)}
                />
                <button
                  type="button"
                  onClick={handleAddTag}
                  className="px-4 py-2 bg-zinc-700 hover:bg-zinc-600 rounded-lg transition-colors duration-200 flex items-center gap-2"
                >
                  <FiPlus className="w-4 h-4" />
                  Add
                </button>
              </div>
              {formData.tags?.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {formData.tags.map((tag, index) => (
                    <span key={index} className="flex items-center gap-2 px-3 py-1 bg-zinc-700 rounded-lg text-sm">
                      {tag}
                      <button
                        type="button"
                        onClick={() => setFormData(prev => ({
                          ...prev,
                          tags: prev.tags.filter((_, i) => i !== index)
                        }))}
                        className="text-red-400 hover:text-red-300"
                      >
                        <FiX className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Frameworks */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-zinc-300 mb-2">Frameworks</label>
              <div className="flex gap-2 mb-2">
                <input
                  type="text"
                  placeholder="Add framework"
                  className="flex-1 px-4 py-2 bg-zinc-800/50 border border-zinc-700/50 rounded-lg text-white placeholder-zinc-500 focus:outline-none focus:ring-0 focus:border-zinc-500 transition-colors duration-200"
                  value={currentFramework}
                  onChange={(e) => setCurrentFramework(e.target.value)}
                />
                <button
                  type="button"
                  onClick={handleAddFramework}
                  className="px-4 py-2 bg-zinc-700 hover:bg-zinc-600 rounded-lg transition-colors duration-200 flex items-center gap-2"
                >
                  <FiPlus className="w-4 h-4" />
                  Add
                </button>
              </div>
              {formData.frameworks?.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {formData.frameworks.map((framework, index) => (
                    <span key={index} className="flex items-center gap-2 px-3 py-1 bg-zinc-700 rounded-lg text-sm">
                      {framework}
                      <button
                        type="button"
                        onClick={() => setFormData(prev => ({
                          ...prev,
                          frameworks: prev.frameworks.filter((_, i) => i !== index)
                        }))}
                        className="text-red-400 hover:text-red-300"
                      >
                        <FiX className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Reporters */}
            <div>
              <label className="block text-sm font-medium text-zinc-300 mb-2">Reporters</label>
              <div className="flex gap-2 mb-2">
                <input
                  type="text"
                  placeholder="Add reporter"
                  className="flex-1 px-4 py-2 bg-zinc-800/50 border border-zinc-700/50 rounded-lg text-white placeholder-zinc-500 focus:outline-none focus:ring-0 focus:border-zinc-500 transition-colors duration-200"
                  value={currentReporter}
                  onChange={(e) => setCurrentReporter(e.target.value)}
                />
                <button
                  type="button"
                  onClick={handleAddReporter}
                  className="px-4 py-2 bg-zinc-700 hover:bg-zinc-600 rounded-lg transition-colors duration-200 flex items-center gap-2"
                >
                  <FiPlus className="w-4 h-4" />
                  Add
                </button>
              </div>
              {formData.reported_by?.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {formData.reported_by.map((reporter, index) => (
                    <span key={index} className="flex items-center gap-2 px-3 py-1 bg-zinc-700 rounded-lg text-sm">
                      {reporter}
                      <button
                        type="button"
                        onClick={() => setFormData(prev => ({
                          ...prev,
                          reported_by: prev.reported_by.filter((_, i) => i !== index)
                        }))}
                        className="text-red-400 hover:text-red-300"
                      >
                        <FiX className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Image Upload */}
          <div className="bg-zinc-900/50 border border-zinc-800/50 rounded-xl p-6">
            <h2 className="text-xl font-semibold mb-4">Cover Image</h2>
            <div className="flex gap-4 items-end">
              <div className="flex-1">
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setFile(e.target.files[0])}
                  className="w-full px-4 py-3 bg-zinc-800/50 border border-zinc-700/50 rounded-lg text-white file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-zinc-700 file:text-white"
                />
              </div>
              <button
                type="button"
                onClick={handleUploadImage}
                disabled={uploadProgress !== null || !file}
                className="px-6 py-3 bg-zinc-700 hover:bg-zinc-600 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg transition-colors duration-200 flex items-center gap-2"
              >
                <FiUpload className="w-4 h-4" />
                {uploadProgress ? `${uploadProgress}%` : 'Upload'}
              </button>
            </div>

            {uploadError && (
              <div className="mt-4 p-3 bg-red-950/30 border border-red-800/30 rounded-lg text-red-100 text-sm">
                {uploadError}
              </div>
            )}

            {formData.image && (
              <div className="mt-4">
                <img
                  src={formData.image}
                  alt="Cover"
                  className="w-full h-48 object-cover rounded-lg border border-zinc-700/50"
                />
              </div>
            )}
          </div>

          {/* Scope Section */}
          <div className="bg-zinc-900/50 border border-zinc-800/50 rounded-xl p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Scope</h2>
              <button
                type="button"
                onClick={handleAddScope}
                className="px-4 py-2 bg-zinc-700 hover:bg-zinc-600 rounded-lg transition-colors duration-200 flex items-center gap-2"
              >
                <FiPlus className="w-4 h-4" />
                Add Scope
              </button>
            </div>
            <div className="space-y-4">
              {formData.scope?.map((scope, index) => (
                <div key={index} className="p-4 bg-zinc-800/30 border border-zinc-700/50 rounded-lg">
                  <div className="flex justify-between items-center mb-3">
                    <span className="text-sm font-medium text-zinc-300">Scope {index + 1}</span>
                    {formData.scope.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleRemoveScope(index)}
                        className="text-red-400 hover:text-red-300"
                      >
                        <FiTrash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <input
                      type="text"
                      placeholder="Name"
                      className="px-3 py-2 bg-zinc-800/50 border border-zinc-700/50 rounded-lg text-white placeholder-zinc-500 focus:outline-none focus:ring-0 focus:border-zinc-500 transition-colors duration-200"
                      value={scope.name || ''}
                      onChange={(e) => handleScopeChange(index, 'name', e.target.value)}
                    />
                    <input
                      type="text"
                      placeholder="Repository URL"
                      className="px-3 py-2 bg-zinc-800/50 border border-zinc-700/50 rounded-lg text-white placeholder-zinc-500 focus:outline-none focus:ring-0 focus:border-zinc-500 transition-colors duration-200"
                      value={scope.repository || ''}
                      onChange={(e) => handleScopeChange(index, 'repository', e.target.value)}
                    />
                    <input
                      type="text"
                      placeholder="Commit Hash"
                      className="px-3 py-2 bg-zinc-800/50 border border-zinc-700/50 rounded-lg text-white placeholder-zinc-500 focus:outline-none focus:ring-0 focus:border-zinc-500 transition-colors duration-200"
                      value={scope.commit_hash || ''}
                      onChange={(e) => handleScopeChange(index, 'commit_hash', e.target.value)}
                    />
                    <textarea
                      placeholder="Description"
                      rows="2"
                      className="px-3 py-2 bg-zinc-800/50 border border-zinc-700/50 rounded-lg text-white placeholder-zinc-500 focus:outline-none focus:ring-0 focus:border-zinc-500 transition-colors duration-200 resize-none"
                      value={scope.description || ''}
                      onChange={(e) => handleScopeChange(index, 'description', e.target.value)}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Impact and Recommendation */}
          <div className="bg-zinc-900/50 border border-zinc-800/50 rounded-xl p-6">
            <h2 className="text-xl font-semibold mb-4">Assessment</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-zinc-300 mb-2">Impact</label>
                <textarea
                  placeholder="Describe the potential impact of this vulnerability..."
                  rows="4"
                  className="w-full px-4 py-3 bg-zinc-800/50 border border-zinc-700/50 rounded-lg text-white placeholder-zinc-500 focus:outline-none focus:ring-0 focus:border-zinc-500 transition-colors duration-200 resize-none"
                  value={formData.impact || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, impact: e.target.value }))}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-zinc-300 mb-2">Recommendation</label>
                <textarea
                  placeholder="Provide recommendations to fix this vulnerability..."
                  rows="4"
                  className="w-full px-4 py-3 bg-zinc-800/50 border border-zinc-700/50 rounded-lg text-white placeholder-zinc-500 focus:outline-none focus:ring-0 focus:border-zinc-500 transition-colors duration-200 resize-none"
                  value={formData.recommendation || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, recommendation: e.target.value }))}
                />
              </div>
            </div>
          </div>

          {/* Main Content Editor */}
          <div className="bg-zinc-900/50 border border-zinc-800/50 rounded-xl p-6">
            <h2 className="text-xl font-semibold mb-4">Detailed Description</h2>
            <ReactQuill
              theme="snow"
              placeholder="Write your detailed bug description..."
              modules={modules}
              formats={formats}
              className="bg-zinc-800 rounded-lg"
              style={{ height: '300px', marginBottom: '60px' }}
              value={formData.content || ''}
              onChange={(value) => setFormData(prev => ({ ...prev, content: value }))}
            />
          </div>

          {/* Submit Button */}
          <div className="flex justify-center">
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-8 py-3 bg-zinc-100 hover:bg-zinc-300 disabled:opacity-50 disabled:cursor-not-allowed text-black font-medium rounded-lg transition-colors duration-200"
            >
              {isSubmitting ? 'Updating...' : 'Update Bug Report'}
            </button>
          </div>

          {publishError && (
            <div className="p-4 bg-red-950/30 border border-red-800/30 rounded-lg text-red-100 text-sm">
              {publishError}
            </div>
          )}
        </form>
      </div>
    </div>
  );
}