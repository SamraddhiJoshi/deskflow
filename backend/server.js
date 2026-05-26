const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(helmet());
app.use(morgan('dev'));

app.use(cors());

app.use(express.json());

app.get('/bfhl', (req, res) => {
  res.status(200).json({
    operation_code: 1
  });
});

app.post('/bfhl', (req, res) => {
  try {
    const data = req.body.data || [];

    const numbers = data.filter(item => !isNaN(item));

    const alphabets = data.filter(item =>
      /^[a-zA-Z]$/.test(item)
    );

    const lowercaseAlphabets = alphabets.filter(
      char => char === char.toLowerCase()
    );

    const highestLowercase =
      lowercaseAlphabets.length > 0
        ? [lowercaseAlphabets.sort().slice(-1)[0]]
        : [];

    const isPrimeFound = numbers.some(num => {
      const n = parseInt(num);

      if (n < 2) return false;

      for (let i = 2; i < n; i++) {
        if (n % i === 0) {
          return false;
        }
      }

      return true;
    });

    res.status(200).json({
      is_success: true,
      user_id: 'samraddhi_joshi_01032006',
      email: 'samraddhijoshi230226@acropolis.in',
      roll_number: '0827CS231231',
      numbers,
      alphabets,
      highest_lowercase_alphabet: highestLowercase,
      is_prime_found: isPrimeFound,
      file_valid: false
    });

  } catch (error) {
    res.status(500).json({
      is_success: false,
      error: 'Something went wrong'
    });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
