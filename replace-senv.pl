# t.XXX[ch]    -> t.channels[ch].XXX
#


$rf=<<'EOF';
        RefreshPSG: function(t,bufferState) {
            var i, ch, WaveMod, WriteBytes, wdtmp, inext, mid, w1, w2, APos, //:integer;
                data=bufferState.buffer,
                BSize=data.length,
                TP = [],
                vCenter = [], //:array [0..Chs-1] of Integer;
                //Steps:array [0..Chs-1] of Integer;
                Lambda, NewLambda, //:Real;
                res, //:MMRESULT;
                WriteTwice, LfoInc, //:Boolean;
                WriteMax, //:integer;
                nowt, //:longint;
                // AllVCenter:Integer;
                Wf=0, Wt=0, WMid=0, WRes=0, WSum=0, v=0, NoiseP=0, Tmporc=0, //:Integer;
                LParam, HParam, WParam, //:Byte;
                JmpSafe, EnvFlag, //:Integer;
                se; //:^TSoundElem;
            //if (!(t.WavPlaying)) return;
            //if ( t.BSize>wdataSize ) t.BSize=wdataSize;
            //mmt.wType=TIME_SAMPLES;
            //WaveOutGetPosition (hwo, @mmt, SizeOf(MMTIME));
            /*APos=mmt.Sample;
     Pos=mmt.Sample mod Bsize;
     if ( calibrationLen>0 ) {
        calibration;
        return;
    }*/
            APos = 0;
            t.Pos = 0;
            t.RPos = t.Pos;

            /*if ( t.BeginPlay ) {
        // WriteAd=(Pos+BSize-1) mod BSize;
        LastWriteStartPos  = mmt.Sample+WriteMaxLen-2;
        LastWriteEndPos    = mmt.Sample+WriteMaxLen-1;
        BeginPlay=False;
     } else {
        //WriteAd=PrevPos;
        LastWriteStartPos  = LastWriteEndPos;
        LastWriteEndPos    = (mmt.Sample+BSize-1);
     }
     if ( (LastWriteEndPos-mmt.Sample>WriteMaxLen) ) {
         LastWriteEndPos=mmt.Sample+WriteMaxLen;
     }
     WriteAd  = LastWriteStartPos % BSize;
     WriteMax = LastWriteEndPos   % BSize;
     if ( WriteAd<0 ) WriteAd=0;
     if ( WriteMax<0 ) WriteMax=0;
*/

            //for ( ch=0 to Chs-1 ) inc (AllVCenter,vCenter[ch]);
            //WTime=GetTickCount;
            EnvFlag = 0;
            LfoInc = True;
            cnt++; //inc(cnt);
            /*if ( cnt mod 4 ==0 ) {

            }*/
            /*if (t.useScriptProcessor) {
                // SCR mode
                t.WriteAd = 0;
                WriteMax = BSize - 1;
            } else {
                WriteMax = t.getPlayPos();
            }*/
            WriteMax=bufferState.WriteMax;

            var mcountK=t.sampleRate / 22050;
            var tempoK=44100 / t.sampleRate ;
            var alstp=false;
            var startTime=new Date().getTime();
            var startSamples=bufferState.writtenSamples;
            //console.log(bufferState.WriteAd, WriteMax);
            //CHANNELS
            while (bufferState.WriteAd != WriteMax) {
                LfoInc = !LfoInc;
                WSum = 0; //128;   // 0 for 16bit
                EnvFlag++;
                if (EnvFlag > 1) EnvFlag = 0;
                for (ch = 0; ch < Chs; ch++) {
                    if (t.MPoint[ch][t.MPointC[ch]] == nil) alstp=t.StopMML(ch);
                    if ((!t.soundMode[ch]) && (t.PlayState[ch] != psPlay)) continue;
                    //----
                    /*while (nextPeekElemIdx[ch] != nextPokeElemIdx[ch]) {
                        se = sndElems[ch][nextPeekElemIdx[ch]];
                        if (APos >= se.time) {
                            t.setSound(ch, se.typ, se.val);
                            t.nextPeekElemIdx[ch] = (t.nextPeekElemIdx[ch] + 1) % sndElemCount;
                        } else break;
                    }*/

                    //---
                    if ((t.soundMode[ch]))
                        v = t.EVol[ch];
                    else if ((t.Resting[ch]))
                        v = 0;
                    else
                        v = t.EShape[ch][t.ECount[ch] >>> 11] * t.EVol[ch] * t.EBaseVol[ch]; // 16bit
                    if (t.Fading < FadeMax) {
                        v = v * div(t.Fading, FadeMax); // 16bit
                    }
                    if (v > 0) {
                        i = chkn(t.SccCount[ch] >>> (32 - t.L2WL[ch]));
                        //inext=(i+1) & ((1 << L2WL[ch])-1);

                        //mid=(SccCount[ch] >> (24-L2WL[ch])) & 255;

                        // *****000 00000000 00000000 00000000
                        //                      ***** 00000000

                        w1 = chkn(t.SccWave[ch][i]);
                        chkn(v);
                        //w2=Byte((SccWave[ch]+inext)^) ;

                        WSum += (
                            div((w1 * v), (16 * 128))
                        ) - div(v, 16);

                        if (!t.Sync[ch]) {
                            (t.SccCount[ch] += t.Steps[ch]);
                        } else {
                            if ((t.SccCount[ch] < -t.Steps[ch] * 2) || (t.SccCount[ch] >= 0))(t.SccCount[ch] += t.Steps[ch]);
                        }
                        if ((t.LfoV[ch] != 0)) {
                            if ((t.LfoDC[ch] > 0)) {
                                (t.LfoDC[ch] -= t.Tempo);
                            } else {
                                (t.SccCount[ch] +=
                                    sinT[t.LfoC[ch] >>> (16 + sinMax_s)] *
                                    div(t.Steps[ch], 512) *
                                    div(t.LfoA[ch], 256)
                                );
                                if (LfoInc) t.LfoC[ch] += t.LfoV[ch];
                            }

                        }
                    }
                    if (t.ECount[ch] + t.ESpeed[ch] < 65536 && (EnvFlag == 0)) t.ECount[ch] += t.ESpeed[ch];
                    //####MMLProc (ch);
                    JmpSafe = 0;
                    //dec (MCount[ch]);
                    if (t.PorLen[ch] > 0) {
                        Tmporc = t.MCount[ch] - t.SeqTime;
                        t.Steps[ch] = (
                            div(t.PorStart[ch], t.PorLen[ch]) * Tmporc +
                            div(t.PorEnd[ch], t.PorLen[ch] * (t.PorLen[ch] - Tmporc))
                        );
                    }
                    //if (ch==0) console.log("ch",ch,"Code",t.MCount[ch],t.SeqTime);

                    while (t.MCount[ch] <= t.SeqTime) {
                        //MCount[ch]=0;
                        var pc = t.MPointC[ch];
                        LParam = t.MPoint[ch][pc + 1];
                        HParam = t.MPoint[ch][pc + 2];
                        var code = t.MPoint[ch][pc];
                        //console.log("ch",ch,"Code",code)
                        if (code >= 0 && code < 96 || code === MRest) {
                            t.Play1Sound(ch, code, t.Slur[ch]);
                            if (!t.Slur[ch]) t.LfoDC[ch] = t.LfoD[ch];
                            t.Slur[ch] = False;
                            //MCount[ch]=SPS div LParam;
                            t.MCount[ch] = t.SeqTime +
                                (LParam + HParam * 256) * 2;
                            // SPS=22050の場合 *2 を *1 に。
                            // SPS=x の場合   * (x/22050)
                            t.MPointC[ch] += 3;
                        } else switch (code) {
                            case MPor:{
                                 t.Play1Por (ch,
                                   LParam,
                                   HParam,
                                   t.Slur[ch]
                                 );
                                 t.Slur[ch]=False;
                                 t.MCount[ch]=t.SeqTime+
                                 ( t.MPoint[ch][pc + 3]+t.MPoint[ch][pc + 4]*256 )*2;
                                // SPS=22050の場合 *2 を *1 に。
                                 t.PorLen[ch]=t.MCount[ch]-t.SeqTime;
                                 t.MPointC[ch]+=5;
                            }break;
                            case MTempo:
                                {
                                    t.Tempo = LParam + HParam * 256;
                                    t.MPointC[ch] += 3;
                                }
                                break;
                            case MVol:
                                {
                                    t.EVol[ch] = LParam;
                                    t.MPointC[ch] += 2;
                                }
                                break;
                            case MBaseVol:
                                {
                                    t.EBaseVol[ch] = LParam;
                                    t.MPointC[ch] += 2;
                                }
                                break;
                            case Mps:
                                {
                                    t.ESpeed[ch] = LParam;
                                    t.MPointC[ch] += 2;
                                }
                                break;
                            case MSelWav:
                                {
                                    //SccWave[ch]=@t.WaveDat[LParam,0];
                                    t.SelWav(ch, LParam);
                                    t.MPointC[ch] += 2;
                                }
                                break;
                            case MWrtWav:
                                {
                                    t.MPointC[ch] += 34; // MWrtWav wavno data*32
                                    for (i = 0; i < 32; i++) {
                                        t.WaveDat[LParam][i] = t.MPoint[ch][pc + 2 + i];
                                    }
                                }
                                break;
                            case MSelEnv:
                                {
                                    t.EShape[ch] = t.EnvDat[LParam];
                                    t.MPointC[ch] += 2;
                                }
                                break;
                            case MWrtEnv:
                                { // MWrtEnv envno data*32
                                    t.MPointC[ch] += 34;
                                    for (i = 0; i < 32; i++) {
                                        wdtmp = t.MPoint[ch][pc + 2 + i];
                                        if (wdtmp > 15) wdtmp = 15;
                                        t.EnvDat[LParam][i] = wdtmp;
                                    }
                                }
                                break;
                            case MJmp:
                                {
                                    if (t.WavOutMode) {
                                        t.MPointC[ch] += 5;
                                    } else {
                                        /*console.log("old mpointc ",t.MPointC[ch],LParam,HParam,t.MPoint[ch][pc + 3],t.MPoint[ch][pc + 4],LParam << 0 +
                                        HParam << 8 +
                                        t.MPoint[ch][pc + 3] << 16 +
                                        t.MPoint[ch][pc + 4] << 24);*/
                                        t.MPointC[ch] += array2Int(t.MPoint[ch], pc+1);
                                        /*LParam << 0 +
                                        HParam << 8 +
                                        t.MPoint[ch][pc + 3] << 16 +
                                        t.MPoint[ch][pc + 4] << 24;*/
                                        //console.log("new mpointc ",t.MPointC[ch]);
                                    }
                                    JmpSafe++;
                                    if (JmpSafe > 1) {
                                        console.log("Jumpsafe!");
                                        alstp=t.StopMML(ch);
                                        t.MCount[ch] = t.SeqTime + 1;
                                    }
                                }
                                break;
                            case MLabel:
                                if (t.WavOutMode && ch==0) console.log("@label", LParam , bufferState.writtenSamples+"/"+t.sampleRate );
                                t.MPointC[ch]+=2;
                                break;
                            case MSlur:
                                {
                                    t.Slur[ch] = True;
                                    t.MPointC[ch] += 1;
                                }
                                break;
                            case MWait:
                                {
                                    t.WaitMML(ch);
                                    t.MPointC[ch] += 1;
                                }
                                break;
                            case MCom:
                                {
                                    t.ComStr = StrPas(t.MPoint[ch], pc + 1);
                                    t.MPointC[ch] += t.ComStr.length + 2; // opcode str \0
                                    //inc (MPoint[ch],length(comstr)+2);
                                }
                                break;
                            case MWOut:
                                {
                                    t.WFilename = StrPas(t.MPoint[ch], pc + 1);
                                    t.MPointC[ch] += t.WFilename.length + 2; // opcode str \0
                                    //inc (MPoint[ch],length(WFilename)+2);
                                }
                                break;
                            case MWEnd:
                                {
                                    t.MPointC[ch] += 1;
                                }
                                break;
                            case MDet:
                                {
                                    t.Detune[ch] = ShortInt(LParam);
                                    t.MPointC[ch] += 2;
                                }
                                break;
                            case MLfo:
                                {
                                    t.LfoSync[ch] = (LParam);
                                    t.LfoV[ch] = (HParam) * 65536;
                                    t.LfoA[ch] = (t.MPoint[ch][pc + 3]);
                                    t.LfoD[ch] = 0;
                                    t.MPointC[ch] += 4;
                                }
                                break;
                            case MLfoD:
                                {
                                    t.LfoD[ch] = LParam * t.sampleRate;
                                    t.MPointC[ch] += 2;
                                }
                                break;
                            case MSync:
                                {
                                    t.Sync[ch] = (LParam == 1);
                                    t.MPointC[ch] += 2;
                                }
                                break;
                            case MPCMReg:{
                                var fn=StrPas(t.MPoint[ch], pc+1);
                                t.RegPCM (fn,t.MPoint[ch][pc+1+fn.length+1]);
                                t.MPointC[ch]+=fn.length +3;
                            }break;
                            case Mend:
                                alstp=t.StopMML(ch); //MPoint[ch]=nil;
                                break;
                            default:
                                throw new Error("Invalid opcode" + code); //ShowMessage ('???'+IntToSTr(Byte(MPoint[ch]^)));
                                alstp=t.StopMML(ch);
                                t.MPointC[ch] += 1;
                        }
                    }
                    // End Of MMLProc
                }
                t.SeqTime += div(t.SeqTime120 + t.Tempo * tempoK, 120) - div(t.SeqTime120, 120);
                t.SeqTime120 += Math.floor( t.Tempo * tempoK) ;

                /*for ( ch=0 to Ses-1 ) {
                    if ( SeLen[ch]>0 ) {
                       //inc (WSum,(Byte(Sept[ch]^)-128)*SeVol[ch] div 128);    //16bit
                       inc (WSum,(Byte(Sept[ch]^)-128)*SeVol[ch]);    //16bit
                       dec (SeLen[ch]);
                       if ( (SeLen[ch]<=0) && (SeReptLen[ch]>0) ) {
                             SeLen[ch]=SeReptLen[ch];
                             dec (SePt[ch],SeLen[ch]);
                       }
                       inc (Sept[ch]);

                    }
                }*/

                //if ( WSum>255 ) WSum=255;     //16bit
                //if ( WSum<0 ) WSum=0;         //16bit
                if (WSum > 32767) WSum = 32767; //16bit
                if (WSum < -32768) WSum = -32768; //16bit

                data[bufferState.WriteAd] = WSum/32768;
                //t.wdata2[bufferState.WriteAd] = WSum;
                //PrevWSum=WSum;
                bufferState.writtenSamples++;
                NoiseP++;
                t.WaveDat[95][NoiseP & 31] = Math.floor(Math.random() * 78 + 90);
                bufferState.WriteAd++;
                bufferState.WriteAd = bufferState.WriteAd % BSize;
                APos++;
                if (alstp) break;
            }
            t.performance.elapsedTime+=new Date().getTime()-startTime;
            t.performance.writtenSamples+=bufferState.writtenSamples-startSamples;
            t.performance.writeRate=t.performance.writtenSamples/(t.performance.elapsedTime/1000*t.sampleRate);
            t.SeqTime120 = t.SeqTime120 % 120;
            //WTime=GetTickCount-WTime;
            t.PrevPos = t.Pos;

            //BufferUnderRun= getPlayPos - LastWriteStartPos;

            //--------------|---------------------------
            //             playpos  LS            LE
            //                       +-------------+

        }//of refreshPSG
EOF
sub rep {
    my ($all,$name)=@_;
    my @r=grep { $_ eq $name } @$chfield;
    if (@r>0) {
        $name;
    } else {
        $all;
    }
}
$chfield=["WaveDat","EnvDat","L2WL","Sync","ECount","MCount","Steps","SccWave","SccCount","EShape","EVol","EBaseVol","MPoint","MPointC","ESpeed","PlayState","Detune","LfoV","LfoD","LfoDC","PorStart","PorEnd","PorLen","soundMode","CurWav","Oct","Resting","Slur","LfoA","LfoC","LfoSync"];

$vars="var __dami";
for (@$chfield) {
    $vars.=",$_=t.$_ ";
}
$vars.=";\n";
$rf =~ s/t\.([\w\d]+)/&rep($&,$1)/eg;
$rf =~ s|//CHANNELS|$vars|eg;

print $rf;
