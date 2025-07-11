import React, { useState, useEffect } from 'react';
import { Calculator } from 'lucide-react';

type Operation = '+' | '-' | '*' | '/' | null;

function App() {
  const [display, setDisplay] = useState('0');
  const [previousValue, setPreviousValue] = useState<number | null>(null);
  const [operation, setOperation] = useState<Operation>(null);
  const [waitingForOperand, setWaitingForOperand] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const inputNumber = (num: string) => {
    if (waitingForOperand) {
      setDisplay(num);
      setWaitingForOperand(false);
      setError(null);
    } else {
      setDisplay(display === '0' ? num : display + num);
    }
  };

  const inputDecimal = () => {
    if (waitingForOperand) {
      setDisplay('0.');
      setWaitingForOperand(false);
    } else if (display.indexOf('.') === -1) {
      setDisplay(display + '.');
    }
  };

  const clear = () => {
    setDisplay('0');
    setPreviousValue(null);
    setOperation(null);
    setWaitingForOperand(false);
    setError(null);
  };

  const performOperation = (nextOperation: Operation) => {
    const inputValue = parseFloat(display);

    if (isNaN(inputValue)) {
      setError('Invalid input');
      return;
    }

    if (previousValue === null) {
      setPreviousValue(inputValue);
    } else if (operation) {
      const currentValue = previousValue || 0;
      let result: number;

      try {
        switch (operation) {
          case '+':
            result = currentValue + inputValue;
            break;
          case '-':
            result = currentValue - inputValue;
            break;
          case '*':
            result = currentValue * inputValue;
            break;
          case '/':
            if (inputValue === 0) {
              setError('Cannot divide by zero');
              return;
            }
            result = currentValue / inputValue;
            break;
          default:
            return;
        }

        if (!isFinite(result)) {
          setError('Result is too large');
          return;
        }

        // Round to avoid floating point precision issues
        result = Math.round(result * 1000000000) / 1000000000;
        
        setDisplay(String(result));
        setPreviousValue(result);
      } catch (err) {
        setError('Calculation error');
        return;
      }
    }

    setWaitingForOperand(true);
    setOperation(nextOperation);
  };

  const calculate = () => {
    performOperation(null);
    setOperation(null);
    setPreviousValue(null);
    setWaitingForOperand(true);
  };

  // Keyboard support
  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      const { key } = event;
      
      if (key >= '0' && key <= '9') {
        inputNumber(key);
      } else if (key === '.') {
        inputDecimal();
      } else if (['+', '-', '*', '/'].includes(key)) {
        performOperation(key as Operation);
      } else if (key === 'Enter' || key === '=') {
        calculate();
      } else if (key === 'Escape' || key === 'c' || key === 'C') {
        clear();
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [display, previousValue, operation, waitingForOperand]);

  const Button = ({ 
    onClick, 
    className = '', 
    children, 
    variant = 'default' 
  }: {
    onClick: () => void;
    className?: string;
    children: React.ReactNode;
    variant?: 'default' | 'operation' | 'equals' | 'clear';
  }) => {
    const baseClasses = "h-16 rounded-xl font-semibold text-lg transition-all duration-200 transform active:scale-95 shadow-lg";
    const variantClasses = {
      default: "bg-gray-700 hover:bg-gray-600 text-white border-2 border-gray-600 hover:border-gray-500",
      operation: "bg-blue-600 hover:bg-blue-500 text-white border-2 border-blue-500 hover:border-blue-400",
      equals: "bg-green-600 hover:bg-green-500 text-white border-2 border-green-500 hover:border-green-400",
      clear: "bg-red-600 hover:bg-red-500 text-white border-2 border-red-500 hover:border-red-400"
    };
    
    return (
      <button
        onClick={onClick}
        className={`${baseClasses} ${variantClasses[variant]} ${className}`}
      >
        {children}
      </button>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-sm bg-gray-800 rounded-2xl shadow-2xl border border-gray-700 overflow-hidden">
        {/* Header */}
        <div className="bg-gray-700 px-6 py-4 flex items-center justify-center border-b border-gray-600">
          <Calculator className="mr-2 text-blue-400" size={24} />
          <h1 className="text-xl font-bold text-white">Calculator</h1>
        </div>

        {/* Display */}
        <div className="p-6 bg-gray-900 border-b border-gray-600">
          <div className="text-right">
            {error ? (
              <div className="text-red-400 text-sm mb-2">{error}</div>
            ) : (
              <div className="text-gray-400 text-sm mb-2 h-5">
                {previousValue !== null && operation ? 
                  `${previousValue} ${operation}` : 
                  '\u00A0'
                }
              </div>
            )}
            <div className="text-white text-3xl font-mono overflow-hidden">
              {display}
            </div>
          </div>
        </div>

        {/* Buttons */}
        <div className="p-6 bg-gray-800">
          <div className="grid grid-cols-4 gap-3">
            {/* First row */}
            <Button onClick={clear} variant="clear" className="col-span-2">
              Clear
            </Button>
            <Button onClick={() => performOperation('/')} variant="operation">
              ÷
            </Button>
            <Button onClick={() => performOperation('*')} variant="operation">
              ×
            </Button>

            {/* Second row */}
            <Button onClick={() => inputNumber('7')}>7</Button>
            <Button onClick={() => inputNumber('8')}>8</Button>
            <Button onClick={() => inputNumber('9')}>9</Button>
            <Button onClick={() => performOperation('-')} variant="operation">
              −
            </Button>

            {/* Third row */}
            <Button onClick={() => inputNumber('4')}>4</Button>
            <Button onClick={() => inputNumber('5')}>5</Button>
            <Button onClick={() => inputNumber('6')}>6</Button>
            <Button onClick={() => performOperation('+')} variant="operation">
              +
            </Button>

            {/* Fourth row */}
            <Button onClick={() => inputNumber('1')}>1</Button>
            <Button onClick={() => inputNumber('2')}>2</Button>
            <Button onClick={() => inputNumber('3')}>3</Button>
            <Button onClick={calculate} variant="equals" className="row-span-2">
              =
            </Button>

            {/* Fifth row */}
            <Button onClick={() => inputNumber('0')} className="col-span-2">
              0
            </Button>
            <Button onClick={inputDecimal}>.</Button>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="mt-8 text-center">
        <p className="text-gray-400 text-sm">
          Created by{' '}
          <span className="text-blue-400 font-semibold">
            Sojeeb Akhtar
          </span>
        </p>
        <p className="text-gray-500 text-xs mt-1">
          Use keyboard for quick input
        </p>
      </div>
    </div>
  );
}

export default App;