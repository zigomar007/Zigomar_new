import React from 'react';
import Header from './components/Header';
import RadioPlayer from './components/RadioPlayer';
import StationInfo from './components/StationInfo';
import CurrentProgram from './components/CurrentProgram';
import Footer from './components/Footer';

function App() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <Header />
      
      <main className="container mx-auto px-4 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
          <div className="lg:col-span-2 space-y-8">
            <RadioPlayer />
            <StationInfo />
          </div>
          
          <div className="space-y-8">
            <CurrentProgram />
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}

export default App;