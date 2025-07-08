import { useEffect, useRef, useState, useCallback } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Link } from 'react-router-dom';
import { FiEdit3, FiTrash2, FiLogOut } from 'react-icons/fi';
import {
  getDownloadURL,
  getStorage,
  ref,
  uploadBytesResumable,
} from 'firebase/storage';
import { app } from '../firebase';
import {
  updateStart,
  updateSuccess,
  updateFailure,
  deleteUserStart,
  deleteUserSuccess,
  deleteUserFailure,
  signoutSuccess,
} from '../redux/user/userSlice';

export default function DashProfile() {
  const { currentUser, error, loading } = useSelector((state) => state.user);
  const [imageFile, setImageFile] = useState(null);
  const [imageFileUrl, setImageFileUrl] = useState(null);
  const [imageFileUploadProgress, setImageFileUploadProgress] = useState(null);
  const [imageFileUploadError, setImageFileUploadError] = useState(null);
  const [formData, setFormData] = useState({});
  const [updateUserSuccess, setUpdateUserSuccess] = useState(null);
  const filePickerRef = useRef();
  const dispatch = useDispatch();

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      setImageFileUrl(URL.createObjectURL(file));
    }
  };

  const uploadImage = useCallback(async () => {
    const storage = getStorage(app);
    const fileName = new Date().getTime() + imageFile.name;
    const storageRef = ref(storage, fileName);
    const uploadTask = uploadBytesResumable(storageRef, imageFile);
    uploadTask.on(
      'state_changed',
      (snapshot) => {
        const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        setImageFileUploadProgress(progress.toFixed(0));
      },
      (error) => {
        setImageFileUploadError('Could not upload image (File must be less than 2MB)');
        setImageFileUploadProgress(null);
        setImageFile(null);
        setImageFileUrl(null);
      },
      () => {
        getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {
          setImageFileUrl(downloadURL);
          setFormData((prev) => ({ ...prev, profilePicture: downloadURL }));
        });
      }
    );
  }, [imageFile]);

  useEffect(() => {
    if (imageFile) {
      uploadImage();
    }
  }, [imageFile, uploadImage]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.id]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (Object.keys(formData).length === 0) return;
    if (imageFileUploadProgress && imageFileUploadProgress < 100) return;

    try {
      dispatch(updateStart());
      const res = await fetch(`/api/user/update/${currentUser._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      if (!res.ok) {
        dispatch(updateFailure(data.message));
      } else {
        dispatch(updateSuccess(data));
        setUpdateUserSuccess("Profile updated successfully");
        setTimeout(() => setUpdateUserSuccess(null), 3000);
      }
    } catch (error) {
      dispatch(updateFailure(error.message));
    }
  };

  const handleDeleteUser = async () => {
    if (!confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
      return;
    }
    
    try {
      dispatch(deleteUserStart());
      const res = await fetch(`/api/user/delete/${currentUser._id}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (!res.ok) {
        dispatch(deleteUserFailure(data.message));
      } else {
        dispatch(deleteUserSuccess(data));
      }
    } catch (error) {
      dispatch(deleteUserFailure(error.message));
    }
  };

  const handleSignout = async () => {
    try {
      const res = await fetch('/api/user/signout', {
        method: 'POST',
      });
      const data = await res.json();
      if (!res.ok) {
        console.log(data.message);
      } else {
        dispatch(signoutSuccess());
      }
    } catch (error) {
      console.log(error.message);
    }
  };

  return (
    <div className="max-w-lg mx-auto p-10 w-full">
      <div className="w-full max-w-sm">
        {/* Header */}
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold mb-2">Profile Settings</h1>
          <p className="text-zinc-400 text-sm">Manage your account information</p>
        </div>

        {/* Profile Form */}
        <div className="bg-zinc-900/50 border border-zinc-800/50 rounded-xl p-5">
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Profile Picture */}
            <div className="flex flex-col items-center">
              <input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                ref={filePickerRef}
                hidden
              />
              <div
                className="relative w-20 h-20 cursor-pointer group"
                onClick={() => filePickerRef.current.click()}
              >
                {/* Upload Progress */}
                {imageFileUploadProgress && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-full">
                    <div className="text-white text-xs font-medium">
                      {imageFileUploadProgress}%
                    </div>
                  </div>
                )}
                
                {/* Profile Image */}
                <img
                  src={imageFileUrl || currentUser.profilePicture}
                  alt="Profile"
                  className={`w-full h-full object-cover rounded-full border-2 border-zinc-700/50 group-hover:border-zinc-600/50 transition-colors duration-200 ${
                    imageFileUploadProgress && imageFileUploadProgress < 100 ? 'opacity-60' : ''
                  }`}
                />
                
                {/* Edit Overlay */}
                <div className="absolute inset-0 bg-black/50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center">
                  <FiEdit3 className="w-3 h-3 text-white" />
                </div>
              </div>
              
              <p className="text-xs text-zinc-400 mt-2 text-center">Click to change</p>
            </div>

            {/* Upload Error */}
            {imageFileUploadError && (
              <div className="p-3 bg-red-950/30 border border-red-800/30 rounded-lg text-red-100 text-center text-xs">
                {imageFileUploadError}
              </div>
            )}

            {/* Form Fields */}
            <div className="space-y-4">
              <div>
                <input
                  type="text"
                  id="username"
                  placeholder="Username"
                  defaultValue={currentUser.username}
                  onChange={handleChange}
                  className="w-full px-3 py-2.5 bg-zinc-800/50 border border-zinc-700/50 rounded-lg text-white placeholder-zinc-500 focus:outline-none focus:ring-0 focus:border-zinc-500 transition-colors duration-200 text-center text-sm"
                />
              </div>

              <div>
                <input
                  type="email"
                  id="email"
                  placeholder="Email"
                  defaultValue={currentUser.email}
                  onChange={handleChange}
                  className="w-full px-3 py-2.5 bg-zinc-800/50 border border-zinc-700/50 rounded-lg text-white placeholder-zinc-500 focus:outline-none focus:ring-0 focus:border-zinc-500 transition-colors duration-200 text-center text-sm"
                />
              </div>

              <div>
                <input
                  type="password"
                  id="password"
                  placeholder="New Password"
                  onChange={handleChange}
                  className="w-full px-3 py-2.5 bg-zinc-800/50 border border-zinc-700/50 rounded-lg text-white placeholder-zinc-500 focus:outline-none focus:ring-0 focus:border-zinc-500 transition-colors duration-200 text-center text-sm"
                />
              </div>
            </div>

            {/* Update Button */}
            <button
              type="submit"
              disabled={loading || (imageFileUploadProgress > 0 && imageFileUploadProgress < 100)}
              className="w-full px-4 py-2.5 bg-zinc-100 hover:bg-zinc-300 text-black font-medium rounded-lg transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
            >
              {loading ? 'Updating...' : 'Update Profile'}
            </button>

            {/* Admin Create Post Button */}
            {currentUser.isAdmin && (
              <Link to="/create-post" className="block">
                <button
                  type="button"
                  className="w-full px-4 py-2.5 bg-zinc-800/50 hover:bg-zinc-700/50 border border-zinc-700/50 text-white font-medium rounded-lg transition-colors duration-200 text-sm"
                >
                  Create New Post
                </button>
              </Link>
            )}
          </form>
        </div>

        {/* Account Actions */}
        <div className="mt-5 flex justify-center gap-6 text-xs">
          <button
            onClick={handleDeleteUser}
            className="flex items-center gap-1 px-2 py-1 text-red-400 hover:text-red-300 transition-colors duration-200"
          >
            <FiTrash2 className="w-3 h-3" />
            Delete
          </button>
          
          <button
            onClick={handleSignout}
            className="flex items-center gap-1 px-2 py-1 text-zinc-400 hover:text-white transition-colors duration-200"
          >
            <FiLogOut className="w-3 h-3" />
            Sign Out
          </button>
        </div>

        {/* Success Message */}
        {updateUserSuccess && (
          <div className="mt-4 p-3 bg-green-950/30 border border-green-800/30 rounded-lg text-green-100 text-center text-xs">
            {updateUserSuccess}
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="mt-4 p-3 bg-red-950/30 border border-red-800/30 rounded-lg text-red-100 text-center text-xs">
            {error}
          </div>
        )}
      </div>
    </div>
  );
}