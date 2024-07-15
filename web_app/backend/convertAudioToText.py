from sys import byteorder
from array import array
from struct import pack
import pyaudio
import wave
import speech_recognition as sr

thresh, chunk, max_val, rate = 500, 1024, 16384, 44100
    
def rem_sil(sound):
    started = False
    output = array('h')

    for i in sound:
        if not started and abs(i)>thresh:
            started = True
            output.append(i)
        elif started:
            output.append(i)

    return output

def record_audio():
    sound_stream = pyaudio.PyAudio().open(format=pyaudio.paInt16, channels=1, rate=rate,
        input=True, output=True,
        frames_per_buffer=chunk)

    t_silent = 0
    started = False

    output = array('h')

    while True:
        # little endian, signed short
        sound = array('h', sound_stream.read(chunk))
        if byteorder == 'big':
            sound.byteswap()
        output.extend(sound)

        silent = max(sound) < thresh

        if silent and started:
            t_silent += 1
        elif not silent and not started:
            started = True

        if started and t_silent > 30:
            break

    width = pyaudio.PyAudio().get_sample_size(pyaudio.paInt16)
    sound_stream.stop_stream()
    sound_stream.close()
    pyaudio.PyAudio().terminate()

    t = float(max_val)/max(abs(i) for i in output)

    avg = array('h')
    for sound in output:
        avg.append(int(sound*t))
    output = avg

    # Remove silence from left end
    temp = rem_sil(output)
    temp.reverse()

    # Remove silence from right end
    temp = rem_sil(temp)
    temp.reverse()
    output = temp

    sil = [0] * int(0.5 * rate)
    temp = array('h', sil)
    temp.extend(output)
    temp.extend(sil)
    output = temp

    return width, output

def record_to_file(path):
    width, data = record_audio()
    data = pack('<' + ('h'*len(data)), *data)

    wf = wave.open(path, 'wb')

    wf.setnchannels(1)
    wf.setsampwidth(width)
    wf.setframerate(rate)
    wf.writeframes(data)

    wf.close()

def convert_audio_to_text(audio):
    r = sr.Recognizer()
    with sr.AudioFile(audio) as src:
        text = r.record(src)
    return r.recognize_google(text)

if __name__ == '__main__':
    print("Begin speaking")
    record_to_file('audio.wav')

    print("Recording audio, converting to text.")
    text = convert_audio_to_text('audio.wav')

    print("Recorded text:", text)