import { useState, useEffect, useMemo } from 'react';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import hljs from 'highlight.js';
import 'highlight.js/styles/atom-one-dark.css'; // Changed to atom-one-dark for better syntax highlighting
import { getDownloadURL, getStorage, ref, uploadBytesResumable } from 'firebase/storage';
import { app } from '../firebase';
import { CircularProgressbar } from 'react-circular-progressbar';
import 'react-circular-progressbar/dist/styles.css';
import { useNavigate, useParams } from 'react-router-dom';
import { useSelector } from 'react-redux';

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

  // Your existing handleUploadImage function
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

      setUploadError(null);
      const storage = getStorage(app);
      const fileName = `zk-bugs/${Date.now()}-${file.name}`;
      const storageRef = ref(storage, fileName);
      const uploadTask = uploadBytesResumable(storageRef, file);

      uploadTask.on(
        'state_changed',
        (snapshot) => {
          const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          setUploadProgress(progress.toFixed(0));
        },
        (error) => {
          console.error('Upload error:', error);
          setUploadError('Failed to upload image');
          setUploadProgress(null);
        },
        async () => {
          try {
            const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
            setFormData((prev) => ({ ...prev, image: downloadURL }));
            setUploadProgress(null);
            setUploadError(null);
            setFile(null);
          } catch (error) {
            setUploadError('Failed to get image URL');
            setUploadProgress(null);
          }
        }
      );
    } catch (error) {
      setUploadError('An unexpected error occurred');
      setUploadProgress(null);
    }
  };

  // Handle array field additions
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

  // Handle scope changes
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

  // Updated submit handler
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`/api/post/updatepost/${formData._id}/${currentUser._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          scope: formData.scope.filter(s => s.name.trim() !== '')
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setPublishError(data.message);
        return;
      }
      setPublishError(null);
      navigate(`/post/${data.slug}`);
    } catch (error) {
      setPublishError('Something went wrong');
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
    clipboard: {
      // Preserve formatting when pasting code
      matchVisual: false,
    }
  }), []);

  const formats = [
    'header', 'font', 'size', 'bold', 'italic', 'underline', 'strike',
    'blockquote', 'list', 'bullet', 'indent', 'link', 'image', 'code-block',
  ];

  return (
    <div className="p-3 max-w-3xl mx-auto min-h-screen">
      <h1 className="text-center text-3xl my-7 font-semibold">Update ZK Bug Report</h1>
      <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
        {/* Title */}
        <div className="flex flex-col gap-4 sm:flex-row justify-between">
          <input
            type="text"
            placeholder="Title"
            required
            className="flex-1 border p-2 bg-zinc-800 rounded-md"
            value={formData.title || ""}
            onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
          />
        </div>

        {/* Publish Date */}
        <div className="flex flex-col gap-4">
          <div className="flex flex-col">
            <label htmlFor="publishDate" className="font-semibold mb-1 text-zinc-300">
              Publish Date:
            </label>
            <input
              type="date"
              id="publishDate"
              required
              className="flex-1 border p-2 bg-zinc-800 rounded-md"
              value={formData.publishDate ? new Date(formData.publishDate).toISOString().split('T')[0] : ''}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, publishDate: e.target.value }))
              }
              
            />
          </div>
        
          {/* Report Source */}
          <div className="flex gap-4">
            <div className="flex-1">
              <label htmlFor="reportSourceName" className="font-semibold mb-1 text-zinc-300">
                Source Name:
              </label>
              <input
                type="text"
                id="reportSourceName"
                placeholder="e.g., Nullity00"
                className="w-full border p-2 bg-zinc-800 rounded-md"
                value={formData.reportSource?.name || ""}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    reportSource: { ...prev.reportSource, name: e.target.value }
                  }))
                }
              />
            </div>
            <div className="flex-1">
              <label htmlFor="reportSourceUrl" className="font-semibold mb-1 text-zinc-300">
                Source URL:
              </label>
              <input
                type="url"
                id="reportSourceUrl"
                placeholder="https://..."
                className="w-full border p-2 bg-zinc-800 rounded-md"
                value={formData.reportSource?.url || ""}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    reportSource: { ...prev.reportSource, url: e.target.value }
                  }))
                }
              />
            </div>
          </div>

          {/* Audit Firm */}
          <div className="flex flex-col">
            <label htmlFor="auditFirm" className="font-semibold mb-1 text-zinc-300">
              Audit Firm:
            </label>
            <input
              type="text"
              id="auditFirm"
              placeholder="Audit Firm Name"
              className="flex-1 border p-2 bg-zinc-800 rounded-md"
              value={formData.auditFirm || ""}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, auditFirm: e.target.value }))
              }
            />
          </div>
        </div>

        {/* Protocol Information */}
        <div className="flex flex-col gap-4 sm:flex-row">
          <input
            type="text"
            placeholder="Protocol Name"
            className="flex-1 border p-2 bg-zinc-800 rounded-md"
            value={formData.protocol?.name || ""}
            onChange={(e) => setFormData(prev => ({
              ...prev,
              protocol: { ...prev.protocol, name: e.target.value }
            }))}
          />
          <select
            className="flex-1 border p-2 bg-zinc-800 rounded-md"
            value={formData.protocol?.type || "OTHER"}
            onChange={(e) => setFormData(prev => ({
              ...prev,
              protocol: { ...prev.protocol, type: e.target.value }
            }))}
          >
            <option value="OTHER">Select Protocol Type</option>
            <option value="ZKEVM">ZKEVM</option>
            <option value="ZK-ROLLUP">ZK-ROLLUP</option>
          </select>
        </div>

        {/* Severity and Difficulty */}
        <div className="flex gap-4">
          <select
            className="flex-1 border p-2 bg-zinc-800 rounded-md"
            value={formData.severity || "N/A"}
            onChange={(e) => setFormData(prev => ({ ...prev, severity: e.target.value }))}
          >
            <option value="N/A">No Severity</option>
            <option value="informational">Informational</option>
            <option value="low">Low Severity</option>
            <option value="medium">Medium Severity</option>
            <option value="high">High Severity</option>
            <option value="critical">Critical Severity</option>
          </select>
          <select
            className="flex-1 border p-2 bg-zinc-800 rounded-md"
            value={formData.difficulty || "N/A"}
            onChange={(e) => setFormData(prev => ({ ...prev, difficulty: e.target.value }))}
          >
            <option value="N/A">No Difficulty</option>
            <option value="low">Low Difficulty</option>
            <option value="medium">Medium Difficulty</option>
            <option value="high">High Difficulty</option>
          </select>
        </div>

        {/* Tags */}
        <div className="flex flex-col gap-2">
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="Add tag"
              className="flex-1 border p-2 bg-zinc-800 rounded-md"
              value={currentTag}
              onChange={(e) => setCurrentTag(e.target.value)}
            />
            <button
              type="button"
              onClick={handleAddTag}
              className="px-4 py-2 bg-zinc-700 rounded-md"
            >
              Add Tag
            </button>
          </div>
          <div className="flex flex-wrap gap-2">
            {formData.tags?.map((tag, index) => (
              <span key={index} className="px-2 py-1 bg-zinc-700 rounded-md">
                {tag}
                <button
                  type="button"
                  className="ml-2 text-red-500"
                  onClick={() => setFormData(prev => ({
                    ...prev,
                    tags: prev.tags.filter((_, i) => i !== index)
                  }))}
                >
                  ×
                </button>
              </span>
            ))}
          </div>
        </div>

        {/* Frameworks */}
        <div className="flex flex-col gap-2">
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="Add framework"
              className="flex-1 border p-2 bg-zinc-800 rounded-md"
              value={currentFramework}
              onChange={(e) => setCurrentFramework(e.target.value)}
            />
            <button
              type="button"
              onClick={handleAddFramework}
              className="px-4 py-2 bg-zinc-700 rounded-md"
            >
              Add Framework
            </button>
          </div>
          <div className="flex flex-wrap gap-2">
            {formData.frameworks?.map((framework, index) => (
              <span key={index} className="px-2 py-1 bg-zinc-700 rounded-md">
                {framework}
                <button
                  type="button"
                  className="ml-2 text-red-500"
                  onClick={() => setFormData(prev => ({
                    ...prev,
                    frameworks: prev.frameworks.filter((_, i) => i !== index)
                  }))}
                >
                  ×
                </button>
              </span>
            ))}
          </div>
        </div>

        {/* Reporters */}
        <div className="flex flex-col gap-2">
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="Add reporter"
              className="flex-1 border p-2 bg-zinc-800 rounded-md"
              value={currentReporter}
              onChange={(e) => setCurrentReporter(e.target.value)}
            />
            <button
              type="button"
              onClick={handleAddReporter}
              className="px-4 py-2 bg-zinc-700 rounded-md"
            >
              Add Reporter
            </button>
          </div>
          <div className="flex flex-wrap gap-2">
            {formData.reported_by?.map((reporter, index) => (
              <span key={index} className="px-2 py-1 bg-zinc-700 rounded-md">
                {reporter}
                <button
                  type="button"
                  className="ml-2 text-red-500"
                  onClick={() => setFormData(prev => ({
                    ...prev,
                    reported_by: prev.reported_by.filter((_, i) => i !== index)
                  }))}
                >
                  ×
                </button>
              </span>
            ))}
          </div>
        </div>

        {/* Scope Section */}
        <div className="flex flex-col gap-4">
          <div className="flex justify-between items-center">
            <h3 className="text-xl">Scope</h3>
            <button
              type="button"
              onClick={handleAddScope}
              className="px-4 py-2 bg-zinc-700 rounded-md"
            >
              Add Scope
            </button>
          </div>
          {formData.scope?.map((scope, index) => (
            <div key={index} className="flex flex-col gap-2 p-4 border border-zinc-700 rounded-md">
              <input
                type="text"
                placeholder="Name"
                className="border p-2 bg-zinc-800 rounded-md"
                value={scope.name || ""}
                onChange={(e) => handleScopeChange(index, 'name', e.target.value)}
              />
              <input
                type="text"
                placeholder="Repository URL"
                className="border p-2 bg-zinc-800 rounded-md"
                value={scope.repository || ""}
                onChange={(e) => handleScopeChange(index, 'repository', e.target.value)}
              />
              <input
                type="text"
                placeholder="Commit Hash"
                className="border p-2 bg-zinc-800 rounded-md"
                value={scope.commit_hash || ""}
                onChange={(e) => handleScopeChange(index, 'commit_hash', e.target.value)}
              />
              <textarea
                placeholder="Description"
                className="border p-2 bg-zinc-800 rounded-md"
                value={scope.description || ""}
                onChange={(e) => handleScopeChange(index, 'description', e.target.value)}
              />
              {formData.scope.length > 1 && (
                <button
                  type="button"
                  className="bg-red-500 text-white p-2 rounded-md mt-2"
                  onClick={() => setFormData(prev => ({
                    ...prev,
                    scope: prev.scope.filter((_, i) => i !== index)
                  }))}
                >
                  Remove Scope
                </button>
              )}
            </div>
          ))}
        </div>

      {/* Finding ID and Target File */}
      <div className="flex gap-4">
        <input
          type="text"
          placeholder="Finding ID"
          className="flex-1 border p-2 bg-zinc-800 rounded-md"
          value={formData.finding_id || ""}
          onChange={(e) => setFormData(prev => ({ ...prev, finding_id: e.target.value }))}
        />
        <input
          type="text"
          placeholder="Target File"
          className="flex-1 border p-2 bg-zinc-800 rounded-md"
          value={formData.target_file || ""}
          onChange={(e) => setFormData(prev => ({ ...prev, target_file: e.target.value }))}
        />
      </div>

      {/* Image Upload Section */}
      <div className="flex gap-4 items-center justify-between p-3">
        <input
          type="file"
          accept="image/*"
          onChange={(e) => setFile(e.target.files[0])}
          className="p-2 rounded-md"
        />
        <button
          type="button"
          className="border border-zinc-500 p-2 bg-zinc-800 text-white rounded-md"
          onClick={handleUploadImage}
          disabled={uploadProgress !== null}
        >
          {uploadProgress ? (
            <div className="w-16 h-16">
              <CircularProgressbar value={uploadProgress} text={`${uploadProgress}%`} />
            </div>
          ) : (
            'Upload Image'
          )}
        </button>
      </div>

      {uploadError && (
        <div className="bg-red-500 text-white p-2 rounded-md mt-4">
          {uploadError}
        </div>
      )}

      {formData.image && (
        <img
          src={formData.image}
          alt="Uploaded"
          className="w-full h-72 object-cover mt-4"
        />
      )}

      {/* Impact and Recommendation */}
      <div className="flex flex-col gap-4">
        <textarea
          placeholder="Impact"
          className="border p-3 bg-zinc-800 rounded-md h-32"
          value={formData.impact || ""}
          onChange={(e) => setFormData(prev => ({ ...prev, impact: e.target.value }))}
        />
        <textarea
          placeholder="Recommendation"
          className="border p-3 bg-zinc-800 rounded-md h-32"
          value={formData.recommendation || ""}
          onChange={(e) => setFormData(prev => ({ ...prev, recommendation: e.target.value }))}
        />
      </div>

      {/* Main Content Editor */}
      <div className="mb-16">
        <label className="block mb-2 text-sm font-medium">Detailed Description</label>
        <ReactQuill
          theme="snow"
          value={formData.content || ""}
          placeholder="Write your detailed bug description..."
          modules={modules}
          formats={formats}
          className="h-72 mb-12 bg-zinc-800"
          required
          onChange={(value) =>
            setFormData((prev) => ({ ...prev, content: value }))
          }
        />
      </div>

      {/* Submit Button */}
      <button
        type="submit"
        className="border border-zinc-700 p-2 bg-zinc-800 rounded-md hover:bg-zinc-700 transition-colors"
      >
        Update Bug Report
      </button>

      {publishError && (
        <div className="bg-red-500 text-white p-2 rounded-md mt-5">
          {publishError}
        </div>
      )}
    </form>
  </div>
);
}