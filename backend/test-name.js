// Test validation for "Nguyễn Nhật Hào"
const fullName = "Nguyễn Nhật Hào";

const nameParts = fullName.trim().split(/\s+/);
console.log("Name parts:", nameParts);

const vietnameseVowels =
    /[aàáảãạăằắẳẵặâầấẩẫậeèéẻẽẹêềếểễệiìíỉĩịoòóỏõọôồốổỗộơờớởỡợuùúủũụưừứửữựyỳýỷỹỵ]/i;

nameParts.forEach((word, index) => {
    console.log(`\n=== Word ${index + 1}: "${word}" ===`);
    console.log("Length:", word.length);

    // Test 1: Has vowel
    const hasVowel = vietnameseVowels.test(word);
    console.log("Has vowel:", hasVowel);

    // Test 2: Consecutive consonants
    const consonantMatch = word.match(/[bcdfghjklmnpqrstvwxyz]{11,}/i);
    console.log("11+ consecutive consonants:", consonantMatch);

    // Test 3: Vowel count
    const vowelMatches = word.match(new RegExp(vietnameseVowels.source, "gi"));
    const vowelCount = vowelMatches ? vowelMatches.length : 0;
    console.log("Vowel matches:", vowelMatches);
    console.log("Vowel count:", vowelCount);

    // Test 4: Consonant count
    const consonantCount = word.length - vowelCount;
    console.log("Consonant count:", consonantCount);

    // Test 5: Ratio check
    if (vowelCount > 0) {
        const ratio = consonantCount / vowelCount;
        console.log("Consonant/Vowel ratio:", ratio);
        console.log(
            "Fails ratio test (>10):",
            consonantCount > vowelCount * 10
        );
    }

    // Test 6: Repeated vowels
    const repeatedVowels =
        /([aeiouàáảãạăằắẳẵặâầấẩẫậèéẻẽẹêềếểễệìíỉĩịòóỏõọôồốổỗộơờớởỡợùúủũụưừứửữựỳýỷỹỵ])\1{2,}/i.test(
            word
        );
    console.log("Has 3+ repeated vowels:", repeatedVowels);

    // Final validation
    const isInvalid =
        !hasVowel ||
        /[bcdfghjklmnpqrstvwxyz]{11,}/i.test(word) ||
        word.length < 1 ||
        word.length > 20 ||
        (vowelCount > 0 && consonantCount > vowelCount * 10) ||
        repeatedVowels;

    console.log(">>> INVALID:", isInvalid);
});
