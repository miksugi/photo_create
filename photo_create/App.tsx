
import React, { useState, useCallback, useRef } from 'react';
import { transformToProfessionalPhoto } from './services/geminiService';
import { ProcessingState, GeneratedImage, Gender } from './types';

const App: React.FC = () => {
  const [originalImage, setOriginalImage] = useState<string | null>(null);
  const [resultImage, setResultImage] = useState<string | null>(null);
  const [gender, setGender] = useState<Gender>(Gender.UNSPECIFIED);
  const [status, setStatus] = useState<ProcessingState>({
    isProcessing: false,
    error: null,
    progressMessage: '',
  });

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setOriginalImage(reader.result as string);
        setResultImage(null);
        setStatus(prev => ({ ...prev, error: null }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleGenerate = async () => {
    if (!originalImage) return;

    setStatus({
      isProcessing: true,
      error: null,
      progressMessage: '사진을 분석하고 전문가 스타일로 변환하는 중입니다...',
    });

    try {
      const mimeType = originalImage.split(';')[0].split(':')[1];
      const result = await transformToProfessionalPhoto(originalImage, mimeType, gender);
      setResultImage(result);
      setStatus(prev => ({ ...prev, isProcessing: false, progressMessage: '' }));
    } catch (err: any) {
      setStatus({
        isProcessing: false,
        error: err.message || '이미지 처리 중 오류가 발생했습니다. 다시 시도해 주세요.',
        progressMessage: '',
      });
    }
  };

  const handleDownload = () => {
    if (!resultImage) return;
    const link = document.createElement('a');
    link.href = resultImage;
    link.download = 'professional-resume-photo.png';
    link.click();
  };

  const reset = () => {
    setOriginalImage(null);
    setResultImage(null);
    setStatus({ isProcessing: false, error: null, progressMessage: '' });
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white">
              <i className="fas fa-id-badge text-lg"></i>
            </div>
            <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-violet-600">
              이력서 사진 AI
            </h1>
          </div>
          {originalImage && (
            <button 
              onClick={reset}
              className="text-sm font-medium text-slate-500 hover:text-slate-700 transition-colors"
            >
              처음부터 다시하기
            </button>
          )}
        </div>
      </header>

      <main className="flex-grow max-w-5xl mx-auto px-4 py-8 w-full">
        {/* Intro */}
        {!originalImage && !status.isProcessing && (
          <div className="text-center py-12">
            <h2 className="text-3xl font-extrabold text-slate-900 mb-4 tracking-tight">
              스튜디오 수준의 증명사진을 집에서 만드세요
            </h2>
            <p className="text-lg text-slate-600 mb-8 max-w-2xl mx-auto break-keep">
              평범한 셀카나 일상 사진을 올려보세요. AI가 이력서나 링크드인 프로필에 바로 사용할 수 있는 고품질 비즈니스 포트레이트로 변환해 드립니다.
            </p>
            
            <div className="max-w-md mx-auto p-8 border-2 border-dashed border-slate-300 rounded-2xl bg-white hover:border-indigo-400 transition-all cursor-pointer group"
                 onClick={() => fileInputRef.current?.click()}>
              <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-indigo-50 transition-colors">
                <i className="fas fa-cloud-upload-alt text-2xl text-slate-400 group-hover:text-indigo-500"></i>
              </div>
              <p className="text-lg font-semibold text-slate-700">클릭하여 사진 업로드</p>
              <p className="text-sm text-slate-500 mt-2">JPG, PNG 또는 WEBP (얼굴 위주의 사진 권장)</p>
              <input 
                type="file" 
                ref={fileInputRef} 
                className="hidden" 
                accept="image/*" 
                onChange={handleFileChange}
              />
            </div>

            <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
              {[
                { icon: 'fa-user-tie', title: '비즈니스 정장', desc: 'AI가 당신에게 딱 맞는 깔끔한 수트나 블레이저로 의상을 교체합니다.' },
                { icon: 'fa-lightbulb', title: '스튜디오 조명', desc: '얼굴을 화사하게 살려주는 전문 스튜디오의 부드러운 조명을 적용합니다.' },
                { icon: 'fa-image', title: '깔끔한 배경', desc: '지저분한 배경을 지우고 신뢰감 있는 스튜디오 배경으로 교체합니다.' }
              ].map((item, idx) => (
                <div key={idx} className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 text-left">
                  <i className={`fas ${item.icon} text-2xl text-indigo-500 mb-3`}></i>
                  <h3 className="font-bold text-slate-800 mb-2">{item.title}</h3>
                  <p className="text-sm text-slate-600 break-keep">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Processing/Result Section */}
        {originalImage && (
          <div className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Original Image Card */}
              <div className="bg-white rounded-2xl shadow-md overflow-hidden border border-slate-200">
                <div className="px-6 py-4 border-b border-slate-100 bg-slate-50 flex justify-between items-center">
                  <span className="text-sm font-bold text-slate-600 uppercase tracking-wider">원본 사진</span>
                </div>
                <div className="aspect-[4/5] bg-slate-200 relative">
                  <img 
                    src={originalImage} 
                    alt="Original" 
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>

              {/* Result Image Card */}
              <div className="bg-white rounded-2xl shadow-md overflow-hidden border border-slate-200 relative">
                <div className="px-6 py-4 border-b border-slate-100 bg-slate-50 flex justify-between items-center">
                  <span className="text-sm font-bold text-slate-600 uppercase tracking-wider">AI 변환 결과</span>
                  {resultImage && (
                    <span className="bg-green-100 text-green-700 text-xs px-2 py-1 rounded font-bold uppercase">준비 완료</span>
                  )}
                </div>
                <div className="aspect-[4/5] bg-slate-200 flex items-center justify-center overflow-hidden">
                  {status.isProcessing ? (
                    <div className="flex flex-col items-center p-8 text-center">
                      <div className="w-12 h-12 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mb-4"></div>
                      <p className="font-medium text-slate-700">{status.progressMessage}</p>
                      <p className="text-xs text-slate-500 mt-2">일반적으로 10~15초 정도 소요됩니다...</p>
                    </div>
                  ) : resultImage ? (
                    <img 
                      src={resultImage} 
                      alt="Transformed" 
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="text-center p-12 text-slate-400">
                      <i className="fas fa-wand-magic-sparkles text-4xl mb-4 opacity-20"></i>
                      <p>여기에 변환된 사진이 표시됩니다</p>
                    </div>
                  )}
                </div>
                {resultImage && (
                  <div className="p-4 bg-white border-t border-slate-100 flex justify-center">
                    <button 
                      onClick={handleDownload}
                      className="flex items-center space-x-2 bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-xl font-bold transition-all shadow-lg hover:shadow-indigo-200"
                    >
                      <i className="fas fa-download"></i>
                      <span>고화질 사진 다운로드</span>
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Controls */}
            {!resultImage && !status.isProcessing && (
              <div className="max-w-lg mx-auto bg-white p-8 rounded-2xl shadow-lg border border-slate-200">
                <h3 className="text-xl font-bold text-slate-800 mb-6 text-center">변환 설정</h3>
                
                <div className="mb-6">
                  <label className="block text-sm font-semibold text-slate-700 mb-3">선호하는 스타일</label>
                  <div className="grid grid-cols-3 gap-3">
                    <button 
                      onClick={() => setGender(Gender.MALE)}
                      className={`py-3 rounded-xl border-2 transition-all flex flex-col items-center ${gender === Gender.MALE ? 'border-indigo-600 bg-indigo-50 text-indigo-700' : 'border-slate-100 text-slate-500 hover:border-slate-200'}`}
                    >
                      <i className="fas fa-mars mb-1"></i>
                      <span className="text-xs font-bold">남성 정장</span>
                    </button>
                    <button 
                      onClick={() => setGender(Gender.FEMALE)}
                      className={`py-3 rounded-xl border-2 transition-all flex flex-col items-center ${gender === Gender.FEMALE ? 'border-indigo-600 bg-indigo-50 text-indigo-700' : 'border-slate-100 text-slate-500 hover:border-slate-200'}`}
                    >
                      <i className="fas fa-venus mb-1"></i>
                      <span className="text-xs font-bold">여성 정장</span>
                    </button>
                    <button 
                      onClick={() => setGender(Gender.UNSPECIFIED)}
                      className={`py-3 rounded-xl border-2 transition-all flex flex-col items-center ${gender === Gender.UNSPECIFIED ? 'border-indigo-600 bg-indigo-50 text-indigo-700' : 'border-slate-100 text-slate-500 hover:border-slate-200'}`}
                    >
                      <i className="fas fa-user mb-1"></i>
                      <span className="text-xs font-bold">중립 스타일</span>
                    </button>
                  </div>
                </div>

                <button 
                  onClick={handleGenerate}
                  disabled={status.isProcessing}
                  className="w-full py-4 bg-gradient-to-r from-indigo-600 to-violet-600 text-white rounded-xl font-bold text-lg shadow-xl shadow-indigo-100 hover:shadow-indigo-200 transition-all flex items-center justify-center space-x-3 disabled:opacity-50"
                >
                  <i className="fas fa-bolt"></i>
                  <span>AI 이력서 사진 생성하기</span>
                </button>
                
                {status.error && (
                  <div className="mt-4 p-4 bg-red-50 text-red-700 rounded-lg text-sm flex items-start space-x-2 border border-red-100">
                    <i className="fas fa-exclamation-circle mt-0.5"></i>
                    <span>{status.error}</span>
                  </div>
                )}
              </div>
            )}

            {resultImage && !status.isProcessing && (
              <div className="text-center">
                <button 
                  onClick={reset}
                  className="text-indigo-600 font-semibold hover:underline"
                >
                  다른 사진으로 다시 시도해볼까요?
                </button>
              </div>
            )}
          </div>
        )}
      </main>

      <footer className="bg-white border-t border-slate-200 py-8">
        <div className="max-w-5xl mx-auto px-4 text-center text-slate-500 text-sm">
          <p>© 2024 ResumeShot AI. Powered by Gemini.</p>
          <div className="flex justify-center space-x-4 mt-2">
            <a href="#" className="hover:text-indigo-600">개인정보 처리방침</a>
            <a href="#" className="hover:text-indigo-600">이용약관</a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default App;
